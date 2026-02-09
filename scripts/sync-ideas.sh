#!/bin/bash
# Sync ideas from filesystem to Supabase documents table

SUPABASE_URL="https://hobabywxwlpclvytsfvy.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvYmFieXd4d2xwY2x2eXRzZnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MTIyMDksImV4cCI6MjA4NjA4ODIwOX0.SZHcmq_ivyMCuVWCJqCMmI7AOHsZxJxaD8U-vvZY3Xg"
IDEAS_DIR="/home/john_honochick/.openclaw/workspace/knowledge/ideas"
TRANSCRIPTS_DIR="/home/john_honochick/.openclaw/workspace/council-transcripts"

echo "Syncing ideas to Supabase..."

# Process each idea file
for f in "$IDEAS_DIR"/*.md; do
  filename=$(basename "$f")
  id="${filename%.md}"
  
  # Extract title
  title=$(grep -m1 "^# " "$f" | sed 's/^# //' | sed 's/Idea: //' | sed 's/Idea #[0-9]*: //')
  
  # Read full content
  content=$(cat "$f")
  
  # Escape for JSON
  content_escaped=$(echo "$content" | jq -Rs .)
  title_escaped=$(echo "$title" | jq -Rs . | sed 's/^"//;s/"$//')
  
  # Upsert to Supabase
  curl -s -X POST "$SUPABASE_URL/rest/v1/documents" \
    -H "apikey: $SUPABASE_KEY" \
    -H "Authorization: Bearer $SUPABASE_KEY" \
    -H "Content-Type: application/json" \
    -H "Prefer: resolution=merge-duplicates" \
    -d "{\"id\": \"idea-$id\", \"title\": \"$title_escaped\", \"content\": $content_escaped, \"doc_type\": \"idea\"}"
  
  echo "  Synced: $id - $title"
done

echo ""
echo "Syncing council transcripts..."

# Process transcripts
for f in "$TRANSCRIPTS_DIR"/*.md; do
  [ -f "$f" ] || continue
  filename=$(basename "$f")
  id="${filename%.md}"
  
  title=$(grep -m1 "^# " "$f" | sed 's/^# //')
  content=$(cat "$f")
  
  content_escaped=$(echo "$content" | jq -Rs .)
  title_escaped=$(echo "$title" | jq -Rs . | sed 's/^"//;s/"$//')
  
  curl -s -X POST "$SUPABASE_URL/rest/v1/documents" \
    -H "apikey: $SUPABASE_KEY" \
    -H "Authorization: Bearer $SUPABASE_KEY" \
    -H "Content-Type: application/json" \
    -H "Prefer: resolution=merge-duplicates" \
    -d "{\"id\": \"transcript-$id\", \"title\": \"$title_escaped\", \"content\": $content_escaped, \"doc_type\": \"council_transcript\"}"
  
  echo "  Synced: $id"
done

echo ""
echo "Done!"
