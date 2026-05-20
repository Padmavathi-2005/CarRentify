"use client";

import React, { useRef, useState } from "react";
import { 
 Bold, 
 Italic, 
 Underline, 
 List, 
 ListOrdered, 
 Link as LinkIcon, 
 Code, 
 Heading1, 
 Heading2,
 Maximize2,
 Eye,
 Type
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HtmlEditorProps {
 value: string;
 onChange: (value: string) => void;
 placeholder?: string;
 label?: string;
 minHeight?: string;
}

export default function HtmlEditor({ value, onChange, placeholder, label, minHeight = "250px" }: HtmlEditorProps) {
 const textareaRef = useRef<HTMLTextAreaElement>(null);
 const [isPreview, setIsPreview] = useState(false);

 const injectTag = (tag: string, endTag?: string) => {
 const textarea = textareaRef.current;
 if (!textarea) return;

 const start = textarea.selectionStart;
 const end = textarea.selectionEnd;
 const text = textarea.value;
 const selectedText = text.substring(start, end);
 
 const before = text.substring(0, start);
 const after = text.substring(end);

 let replacement = "";
 if (endTag) {
 replacement = `<${tag}>${selectedText}</${endTag}>`;
 } else if (tag === "UL" || tag === "OL") {
 const listTag = tag.toLowerCase();
 replacement = `<${listTag}>\n <li>${selectedText || "Item"}</li>\n</${listTag}>`;
 } else if (tag === "LI") {
 replacement = `<li>${selectedText || "Item"}</li>`;
 } else if (tag === "B") {
 replacement = `<strong>${selectedText || "Bold Text"}</strong>`;
 } else if (tag === "I") {
 replacement = `<em>${selectedText || "Italic Text"}</em>`;
 } else {
 replacement = `<${tag.toLowerCase()}>${selectedText}</${tag.toLowerCase()}>`;
 }

 const newValue = before + replacement + after;
 onChange(newValue);

 // Reset focus and selection
 setTimeout(() => {
 textarea.focus();
 const newCursorPos = start + replacement.length;
 textarea.setSelectionRange(newCursorPos, newCursorPos);
 }, 10);
 };

 const tools = [
 { label: "H1", icon: <Heading1 size={14} />, action: () => injectTag("h1") },
 { label: "H2", icon: <Heading2 size={14} />, action: () => injectTag("h2") },
 { label: "B", icon: <Bold size={14} />, action: () => injectTag("B") },
 { label: "I", icon: <Italic size={14} />, action: () => injectTag("I") },
 { label: "U", icon: <Underline size={14} />, action: () => injectTag("u") },
 { label: "UL", icon: <List size={14} />, action: () => injectTag("UL") },
 { label: "OL", icon: <ListOrdered size={14} />, action: () => injectTag("OL") },
 { label: "LI", icon: <div className="text-[10px] font-black">LI</div>, action: () => injectTag("LI") },
 { label: "Link", icon: <LinkIcon size={14} />, action: () => {
 const url = prompt("Enter URL:", "https://");
 if (url) injectTag(`a href="${url}"`, "a");
 }},
 { label: "Code", icon: <Code size={14} />, action: () => injectTag("code") },
 ];

 return (
 <div className="space-y-3">
 {label && <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">{label}</label>}
 <div className="border-2 border-slate-100 rounded-app overflow-hidden bg-white focus-within:border-primary transition-all">
 <div className="bg-slate-50/50 p-2 border-b border-slate-100 flex flex-wrap gap-1.5 items-center">
 {tools.map(tool => (
 <button
 key={tool.label}
 type="button"
 onClick={tool.action}
 className="h-8 px-2.5 flex items-center justify-center bg-white border border-slate-200 rounded-md text-slate-400 hover:text-primary hover:border-primary/30 transition-all active:scale-95"
 title={tool.label}
 >
 {tool.icon}
 </button>
 ))}
 <div className="flex-1" />
 <button
 type="button"
 onClick={() => setIsPreview(!isPreview)}
 className={cn(
 "h-8 px-4 flex items-center justify-center rounded-md font-black text-[9px] uppercase tracking-widest transition-all gap-2",
 isPreview ? "bg-primary text-white" : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
 )}
 >
 {isPreview ? <Type size={12} /> : <Eye size={12} />}
 {isPreview ? "Edit Source" : "Preview View"}
 </button>
 </div>
 
 {isPreview ? (
 <div 
 className="p-8 font-medium text-slate-700 bg-white overflow-y-auto max-h-[500px] leading-relaxed break-words rich-text-preview"
 style={{ minHeight }}
 dangerouslySetInnerHTML={{ __html: value || `<p class="text-slate-300 italic">No content to preview...</p>` }}
 />
 ) : (
 <textarea
 ref={textareaRef}
 value={value}
 onChange={(e) => onChange(e.target.value)}
 placeholder={placeholder || "Inject HTML or write plain text..."}
 className="w-full p-8 font-mono text-xs text-slate-700 bg-white border-none outline-none focus:ring-0 resize-y leading-relaxed"
 style={{ minHeight }}
 />
 )}
 </div>
 <p className="text-[9px] font-bold text-slate-400 px-1 uppercase tracking-widest">Advanced HTML Registry Enabled • Bullet Points & Headers Supported</p>
 
 <style jsx global>{`
 .rich-text-preview h1 { font-size: 1.875rem; font-weight: 900; margin-bottom: 1.5rem; color: #0f172a; line-height: 1.2; }
 .rich-text-preview h2 { font-size: 1.5rem; font-weight: 800; margin-bottom: 1.25rem; color: #1e293b; margin-top: 2rem; }
 .rich-text-preview p { margin-bottom: 1rem; }
 .rich-text-preview ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
 .rich-text-preview ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1rem; }
 .rich-text-preview li { margin-bottom: 0.5rem; }
 .rich-text-preview strong { font-weight: 800; color: #0f172a; }
 .rich-text-preview em { font-style: italic; }
 .rich-text-preview code { background: #f1f5f9; padding: 0.2rem 0.4rem; rounded: 0.25rem; font-family: monospace; font-size: 0.875em; }
 .rich-text-preview a { color: #3f147b; text-decoration: underline; font-weight: 700; }
 `}</style>
 </div>
 );
}
