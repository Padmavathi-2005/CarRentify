'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ShieldCheck, Trash2, Clock, FileText, ArrowLeft } from 'lucide-react';
import { useLocale } from '@/components/LocaleContext';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function DeletionPolicyPage() {
 const { t } = useLocale();
 return (
 <div className="min-h-screen bg-[#F8FAFC]">
 <Header />
 
 <main className="max-w-[800px] mx-auto pt-32 pb-24 px-6">
 <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-primary transition-colors mb-12">
 <ArrowLeft size={14} /> {t('policy.deletion.back_home')}
 </Link>

 <motion.div 
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 className="bg-white rounded-app border border-slate-100 p-10 lg:p-16 -200/50"
 >
 <div className="flex items-center gap-4 mb-8">
 <div className="w-16 h-16 rounded-app bg-rose-50 text-rose-500 flex items-center justify-center">
 <ShieldCheck size={32} />
 </div>
 <div>
 <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">{t('policy.deletion.title')}</h1>
<p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">{t('policy.deletion.subtitle')}</p>
 </div>
 </div>

 <div className="space-y-12 prose prose-slate max-w-none">
 {/* Section 1 */}
 <section>
 <div className="flex items-center gap-3 mb-4">
 <Clock className="text-primary" size={20} />
 <h2 className="text-xl font-bold text-slate-900 m-0">{t('policy.deletion.grace_title')}</h2>
 </div>
 <p className="text-slate-600 leading-relaxed">
 {t('policy.deletion.grace_desc')}
</p>
 </section>

 {/* Section 2 */}
 <section>
 <div className="flex items-center gap-3 mb-4">
 <Trash2 className="text-rose-500" size={20} />
 <h2 className="text-xl font-bold text-slate-900 m-0">{t('policy.deletion.delete_title')}</h2>
 </div>
 <p className="text-slate-600 leading-relaxed">
 {t('policy.deletion.delete_desc')}
</p>
 <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mt-4 text-sm font-bold text-slate-700 list-none p-0">
 <li className="flex items-center gap-2">✓ {t('policy.deletion.legal_name')}</li>
<li className="flex items-center gap-2">✓ {t('policy.deletion.email')}</li>
<li className="flex items-center gap-2">✓ {t('policy.deletion.phone')}</li>
<li className="flex items-center gap-2">✓ {t('policy.deletion.address')}</li>
<li className="flex items-center gap-2">✓ {t('policy.deletion.identity_images')}</li>
<li className="flex items-center gap-2">✓ {t('policy.deletion.social_links')}</li>
 </ul>
 </section>

 {/* Section 3 */}
 <section>
 <div className="flex items-center gap-3 mb-4">
 <FileText className="text-slate-900" size={20} />
 <h2 className="text-xl font-bold text-slate-900 m-0">{t('policy.deletion.retain_title')}</h2>
 </div>
 <p className="text-slate-600 leading-relaxed">
 {t('policy.deletion.retain_desc')}
</p>
 <div className="bg-slate-50 p-6 rounded-app border border-slate-100">
 <p className="text-[11px] font-bold text-slate-500 leading-relaxed uppercase tracking-wide italic">
 {t('policy.deletion.audit_note')}
</p>
 </div>
 </section>

 <div className="pt-12 border-t border-slate-50 text-center">
 <p className="text-xs text-slate-400 font-medium italic">
 {t('policy.deletion.last_updated')}
</p>
 </div>
 </div>
 </motion.div>
 </main>

 <Footer />
 </div>
 );
}
