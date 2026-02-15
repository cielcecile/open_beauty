-- Update the vector dimension to 3072 (matching the available model)
alter table hospital_knowledge alter column embedding type vector(3072);

-- Drop and recreate the search function with the new dimension
drop function if exists match_hospital_knowledge;

create or replace function match_hospital_knowledge (
  query_embedding vector(3072),
  match_threshold float,
  match_count int,
  filter_hospital_id text
)
returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    hospital_knowledge.id,
    hospital_knowledge.content,
    hospital_knowledge.metadata,
    1 - (hospital_knowledge.embedding <=> query_embedding) as similarity
  from hospital_knowledge
  where 1 - (hospital_knowledge.embedding <=> query_embedding) > match_threshold
  and hospital_knowledge.hospital_id = filter_hospital_id
  order by hospital_knowledge.embedding <=> query_embedding
  limit match_count;
end;
$$;
