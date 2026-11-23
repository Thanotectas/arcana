-- Arcana: el bucket «redes» acepta también audio MP3. Lo usan la voz de Sibila para los videos (voz-sibila/), la voz
-- traducida de la Sala de Sibila (en-vivo/sala/) y las frases de espera del directo (en-vivo/puentes/); sin este tipo,
-- Supabase rechazaba cada audio («mime type audio/mpeg is not supported»).
update storage.buckets
   set allowed_mime_types = array(select distinct unnest(coalesce(allowed_mime_types, '{}') || array['audio/mpeg']))
 where id = 'redes';
