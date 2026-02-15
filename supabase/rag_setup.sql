-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create a table to store your hospital knowledge base
create table if not exists hospital_knowledge (
  id bigint primary key generated always as identity,
  hospital_id text not null references hospitals(id) on delete cascade,
  content text not null,
  embedding vector(768), -- Gemini text-embedding-004 dimension
  metadata jsonb,
  created_at timestamp with time zone default now()
);

-- Create a function to search for similar content
create or replace function match_hospital_knowledge (
  query_embedding vector(768),
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
