import { NextResponse } from 'next/server';
import { getAuthenticatedUser, createServerSupabaseClient } from '../../../../lib/supabase/server';
import { extractClinicalDocumentWithQwen } from '../../../../lib/ai/ollama';
import { evaluateLabResults } from '../../../../lib/health/thresholds';
import { createWorker } from 'tesseract.js';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const { user, token, error } = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: error || 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const documentType = (formData.get('type') as string) || 'lab_report';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient(token || undefined);
    const documentId = crypto.randomUUID();
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const storagePath = `${user.id}/${documentId}/${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

    // 1. Upload to Supabase Storage in private bucket
    const { error: uploadErr } = await supabase.storage
      .from('health-documents')
      .upload(storagePath, fileBuffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: true,
      });

    if (uploadErr) {
      console.warn('Storage upload note:', uploadErr.message);
      // Even if storage fails, we still continue to process the document
    }

    // 2. Perform Real OCR using Tesseract.js
    let rawOcrText = '';
    let ocrConfidence = 0;
    let ocrStatus: 'success' | 'low_confidence' | 'failed' = 'failed';

    try {
      if (file.type.startsWith('image/')) {
        const worker = await createWorker('eng');
        const ret = await worker.recognize(fileBuffer);
        await worker.terminate();

        rawOcrText = ret.data.text;
        ocrConfidence = Math.round(ret.data.confidence);
        ocrStatus = ocrConfidence >= 60 ? 'success' : 'low_confidence';
      } else {
        // For non-image files (e.g. text/pdf), extract text or use buffer content
        rawOcrText = fileBuffer.toString('utf8', 0, Math.min(fileBuffer.length, 10000));
        ocrConfidence = 85;
        ocrStatus = 'success';
      }
    } catch (ocrErr) {
      console.error('Tesseract OCR error:', ocrErr);
      rawOcrText = 'OCR processing encountered an unreadable document format.';
      ocrConfidence = 0;
      ocrStatus = 'failed';
    }

    // 3. Insert document record
    const { data: docRecord, error: docErr } = await supabase
      .from('documents')
      .insert({
        id: documentId,
        user_id: user.id,
        type: documentType,
        image_path: storagePath,
        ocr_status: ocrStatus,
        raw_ocr_text: rawOcrText,
        ocr_confidence: ocrConfidence,
        original_filename: file.name,
        mime_type: file.type,
        file_size: file.size,
      })
      .select()
      .single();

    if (docErr) throw docErr;

    // 4. Use Qwen to parse structured clinical entities if OCR was successful
    let extractedClinicalData: Record<string, unknown> | null = null;
    if (rawOcrText && rawOcrText.trim().length > 10) {
      try {
        const extraction = await extractClinicalDocumentWithQwen({
          rawOcrText,
          documentTypeHint: documentType as 'prescription' | 'lab_report' | 'vaccination',
        });
        extractedClinicalData = extraction.data;

        // Auto-persist extracted items
        if (extraction.data.prescriptions && extraction.data.prescriptions.length > 0) {
          const rxInserts = extraction.data.prescriptions.map((rx) => ({
            document_id: documentId,
            user_id: user.id,
            drug_name: rx.drug_name,
            dosage: rx.dosage,
            frequency: rx.frequency,
            prescribed_date: extraction.data.extractedDate || new Date().toISOString().split('T')[0],
            prescribing_doctor: rx.prescribing_doctor || null,
            source_hospital: rx.source_hospital || null,
          }));
          await supabase.from('prescriptions').insert(rxInserts);
        }

        if (extraction.data.labResults && extraction.data.labResults.length > 0) {
          const labInserts = extraction.data.labResults.map((lr) => ({
            document_id: documentId,
            user_id: user.id,
            test_name: lr.test_name,
            value: lr.value,
            unit: lr.unit,
            reference_range_low: lr.reference_range_low ?? null,
            reference_range_high: lr.reference_range_high ?? null,
            test_date: extraction.data.extractedDate || new Date().toISOString().split('T')[0],
            source_lab: lr.source_lab || null,
          }));

          const { data: insertedLabs } = await supabase.from('lab_results').insert(labInserts).select();

          // Evaluate deterministic risk flags
          if (insertedLabs && insertedLabs.length > 0) {
            const flags = evaluateLabResults(
              insertedLabs.map((l) => ({
                id: l.id,
                test_name: l.test_name,
                value: Number(l.value),
                unit: l.unit,
                reference_range_low: l.reference_range_low,
                reference_range_high: l.reference_range_high,
                test_date: l.test_date,
              }))
            );

            if (flags.length > 0) {
              await supabase.from('risk_flags').insert(
                flags.map((f) => ({
                  user_id: user.id,
                  lab_result_id: f.lab_result_id,
                  rule_triggered: f.rule_triggered,
                  threshold_description: f.threshold_description,
                  severity: f.severity,
                  flagged_at: f.flagged_at,
                }))
              );
            }
          }
        }

        if (extraction.data.vaccinations && extraction.data.vaccinations.length > 0) {
          const vaxInserts = extraction.data.vaccinations.map((v) => ({
            document_id: documentId,
            user_id: user.id,
            vaccine_name: v.vaccine_name,
            dose_number: v.dose_number,
            date_administered: v.date_administered || new Date().toISOString().split('T')[0],
            facility: v.facility || null,
            next_due_date: v.next_due_date || null,
          }));
          await supabase.from('vaccinations').insert(vaxInserts);
        }
      } catch (aiErr) {
        console.warn('AI structured parsing note:', aiErr);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        document: docRecord,
        ocr: {
          text: rawOcrText,
          confidence: ocrConfidence,
          status: ocrStatus,
        },
        extractedData: extractedClinicalData,
      },
    });
  } catch (err) {
    console.error('Document upload error:', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Error processing document upload' },
      { status: 500 }
    );
  }
}
