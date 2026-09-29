"""
Knowledge base ingestion, parsing and document chunking for JAL IMPACT RAG.
"""

import os
from typing import List, Dict, Any

class DocumentChunk:
    def __init__(self, doc_id: str, title: str, source: str, content: str, category: str):
        self.doc_id = doc_id
        self.title = title
        self.source = source
        self.content = content
        self.category = category
        self.embedding: List[float] = []

    def to_dict(self) -> Dict[str, Any]:
        return {
            "doc_id": self.doc_id,
            "title": self.title,
            "source": self.source,
            "content": self.content,
            "category": self.category
        }


class KnowledgeBaseManager:
    def __init__(self, base_dir: str = None):
        if base_dir is None:
            # Default to the knowledge directory adjacent to rag/
            curr_dir = os.path.dirname(os.path.abspath(__file__))
            self.base_dir = os.path.join(os.path.dirname(curr_dir), "knowledge")
        else:
            self.base_dir = base_dir
            
        self.chunks: List[DocumentChunk] = []

    def load_all_documents(self) -> List[DocumentChunk]:
        """Loads and parses all markdown and text files in the knowledge directory."""
        self.chunks = []
        if not os.path.exists(self.base_dir):
            return self.chunks

        for root, _, files in os.walk(self.base_dir):
            for file in files:
                if file.endswith(".md") or file.endswith(".txt"):
                    file_path = os.path.join(root, file)
                    rel_category = os.path.basename(root)
                    self._parse_and_chunk_file(file_path, file, rel_category)

        return self.chunks

    def _parse_and_chunk_file(self, file_path: str, filename: str, category: str):
        """Splits markdown file into section-based chunks using headers."""
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                raw_text = f.read()
        except Exception:
            return

        sections = raw_text.split("\n## ")
        main_title = filename.replace(".md", "").replace("_", " ").title()

        if sections:
            first_part = sections[0].strip()
            if first_part.startswith("# "):
                lines = first_part.split("\n")
                main_title = lines[0].replace("# ", "").strip()

            chunk = DocumentChunk(
                doc_id=f"{filename}#intro",
                title=f"{main_title} - Overview",
                source=filename,
                content=first_part,
                category=category
            )
            self.chunks.append(chunk)

            # Subsequent sections
            for i, sec in enumerate(sections[1:]):
                lines = sec.split("\n")
                sec_title = lines[0].strip()
                sec_body = "\n".join(lines[1:]).strip()
                
                full_content = f"### {sec_title}\n{sec_body}"
                chunk = DocumentChunk(
                    doc_id=f"{filename}#sec-{i+1}",
                    title=f"{main_title} > {sec_title}",
                    source=filename,
                    content=full_content,
                    category=category
                )
                self.chunks.append(chunk)
