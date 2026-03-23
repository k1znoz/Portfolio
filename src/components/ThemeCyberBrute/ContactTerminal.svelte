<script>
    export let contactLinks = []
</script>

<!-- CONTACT / TERMINAL INPUT -->
<section id="contact" class="scroll-mt-20 p-8 lg:p-12">
<div class="max-w-4xl mx-auto border-2 border-outline-variant bg-surface-container-highest p-1 shadow-[8px_8px_0px_0px_rgba(255,143,115,0.1)]">
<div class="bg-surface-container flex items-center justify-between px-4 py-2 border-b-2 border-outline-variant">
<div class="flex gap-2">
<div class="w-3 h-3 bg-error"></div>
<div class="w-3 h-3 bg-primary"></div>
<div class="w-3 h-3 bg-tertiary"></div>
</div>
<div class="font-label text-[10px] font-bold text-on-surface-variant uppercase">CONNECTION_SECURE: AES-256</div>
</div>
<div class="p-8 font-label">
<div class="mb-4 text-tertiary">root@portfolio:~# <span class="text-on-surface">init contact --project</span></div>
<div class="mb-8 text-on-surface-variant">DECRIS TON BESOIN, LA DEADLINE ET LE CONTEXTE. REPONSE RAPIDE.</div>
<form class="space-y-6" action="/api/contact" method="post">
<div class="group">
<label for="cyber-name" class="block text-primary text-xs font-black mb-2 uppercase">_NAME_ID</label>
<input id="cyber-name" name="name" class="w-full bg-transparent border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 text-on-surface font-headline placeholder:text-surface-container-highest transition-colors" placeholder="TON_NOM" type="text" required/>
</div>
<div class="group">
<label for="cyber-email" class="block text-primary text-xs font-black mb-2 uppercase">_EMAIL_PROTOCOL</label>
<input id="cyber-email" name="email" class="w-full bg-transparent border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 text-on-surface font-headline placeholder:text-surface-container-highest transition-colors" placeholder="TON@EMAIL.COM" type="email" required/>
</div>
<div class="group">
<label for="cyber-message" class="block text-primary text-xs font-black mb-2 uppercase">_DATA_PAYLOAD</label>
<textarea id="cyber-message" name="message" class="w-full bg-transparent border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 text-on-surface font-headline placeholder:text-surface-container-highest transition-colors resize-none" placeholder="DECRIS_TON_PROJET..." rows="4" minlength="20" required></textarea>
</div>
<div class="pt-4 flex justify-between items-center">
<div class="text-[10px] text-outline italic">_AWAITING_PROJECT_BRIEF</div>
<button class="bg-primary text-on-primary px-10 py-3 font-headline font-black uppercase hover:bg-on-surface hover:text-surface transition-colors flex items-center gap-2" type="submit">
                                ENVOYER
                                <span class="material-symbols-outlined text-sm" data-icon="terminal">terminal</span>
</button>
</div>
</form>

<div class="mt-8 flex flex-wrap gap-3">
    {#each contactLinks as link}
        <a href={link.href} target="_blank" rel="noreferrer" class="border border-outline px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant hover:text-primary hover:border-primary transition-colors">
            {link.label}
        </a>
    {/each}
</div>
</div>
</div>
</section>
