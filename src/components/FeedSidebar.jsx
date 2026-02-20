export default function FeedSidebar() {
    return (
        <aside className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark/50 hidden xl:flex flex-col flex-shrink-0 z-20">
            <div className="p-6 h-full flex flex-col gap-6">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
                    Activity Feed
                    <span className="material-symbols-outlined !text-lg text-slate-400">history</span>
                </h3>
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4">
                    {/* Feed Item 1 */}
                    <div className="flex gap-3 items-start group">
                        <div className="size-8 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined !text-base">person_add</span>
                        </div>
                        <div className="flex flex-col">
                            <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug">
                                <span className="font-bold">Sarah Jenkins</span> joined the <span className="text-primary font-medium">Design Team</span> pod
                            </p>
                            <span className="text-[10px] text-slate-400 mt-1">14 minutes ago</span>
                        </div>
                    </div>
                    {/* Feed Item 2 */}
                    <div className="flex gap-3 items-start">
                        <div className="size-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex-shrink-0 flex items-center justify-center text-blue-500">
                            <span className="material-symbols-outlined !text-base">update</span>
                        </div>
                        <div className="flex flex-col">
                            <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug">
                                <span className="font-bold">Alex Chen</span> updated <span className="italic font-medium underline decoration-primary/30 underline-offset-2 cursor-pointer">Project Specs</span>
                            </p>
                            <span className="text-[10px] text-slate-400 mt-1">2 hours ago</span>
                        </div>
                    </div>
                    {/* Feed Item 3 */}
                    <div className="flex gap-3 items-start">
                        <div className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 flex-shrink-0 flex items-center justify-center text-slate-500">
                            <span className="material-symbols-outlined !text-base">comment</span>
                        </div>
                        <div className="flex flex-col">
                            <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug">
                                New comment on <span className="font-bold">Q4 Roadmap</span> by <span className="font-medium">Liam O.</span>
                            </p>
                            <span className="text-[10px] text-slate-400 mt-1">Yesterday</span>
                        </div>
                    </div>
                    {/* Feed Item 4 */}
                    <div className="flex gap-3 items-start">
                        <div className="size-8 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined !text-base">add</span>
                        </div>
                        <div className="flex flex-col">
                            <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug">
                                <span className="font-bold">You</span> created a new private pod: <span className="text-primary font-medium">Vacation Ideas</span>
                            </p>
                            <span className="text-[10px] text-slate-400 mt-1">3 days ago</span>
                        </div>
                    </div>
                </div>
                {/* Footer Action Area */}
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-auto">
                    <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-4 border border-primary/10">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="material-symbols-outlined text-primary">auto_awesome</span>
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Pro Tip</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-3">Use <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[9px] font-bold">Cmd</kbd> + <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[9px] font-bold">K</kbd> to quickly search anything across PodNotes.</p>
                        <button className="w-full py-2 bg-primary text-white text-[11px] font-bold rounded-full hover:bg-primary/90 transition-all">Learn Keyboard Shortcuts</button>
                    </div>
                </div>
            </div>
        </aside>
    );
}
