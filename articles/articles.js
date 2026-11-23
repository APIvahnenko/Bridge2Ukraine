// Scrolling effects for the article pages: parallax images,
// fade-in on scroll, reading progress bar, share buttons,
// and the draft-highlight toggle.
(function () {
    document.documentElement.classList.add('js');

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // --- Parallax: images move a little slower than the page ---
    const parallaxImgs = Array.from(document.querySelectorAll('.parallax-img'));
    const progressBar = document.querySelector('.read-progress');
    let ticking = false;

    function update() {
        ticking = false;
        const vh = window.innerHeight;

        if (!reduceMotion) {
            parallaxImgs.forEach(function (img) {
                const box = img.parentElement.getBoundingClientRect();
                if (box.bottom < 0 || box.top > vh) return;
                // -1 when the section is below the screen, +1 when above it
                const centre = box.top + box.height / 2;
                const progress = (vh / 2 - centre) / (vh / 2 + box.height / 2);
                img.style.transform = 'translate3d(0,' + (progress * 10).toFixed(2) + '%,0)';
            });
        }

        if (progressBar) {
            const max = document.documentElement.scrollHeight - vh;
            const amount = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
            progressBar.style.transform = 'scaleX(' + amount + ')';
        }
    }

    function onScroll() {
        if (!ticking) {
            ticking = true;
            window.requestAnimationFrame(update);
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();

    // --- Fade sections in as they arrive on screen ---
    const revealEls = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -10% 0px' });
        revealEls.forEach(function (el) { observer.observe(el); });
    } else {
        revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    }

    // --- Share buttons ---
    const pageUrl = window.location.href.split('#')[0];
    const title = document.title;

    document.querySelectorAll('[data-share]').forEach(function (el) {
        const url = encodeURIComponent(pageUrl);
        const text = encodeURIComponent(title);
        switch (el.dataset.share) {
            case 'whatsapp':
                el.href = 'https://wa.me/?text=' + text + '%20' + url;
                break;
            case 'facebook':
                el.href = 'https://www.facebook.com/sharer/sharer.php?u=' + url;
                break;
            case 'linkedin':
                el.href = 'https://www.linkedin.com/sharing/share-offsite/?url=' + url;
                break;
            case 'email':
                el.href = 'mailto:?subject=' + text + '&body=' + url;
                break;
            case 'copy':
                el.addEventListener('click', function () {
                    const done = function () {
                        el.textContent = 'Link copied';
                        setTimeout(function () { el.textContent = 'Copy link'; }, 2000);
                    };
                    if (navigator.share && window.matchMedia('(pointer: coarse)').matches) {
                        navigator.share({ title: title, url: pageUrl }).catch(function () {});
                    } else if (navigator.clipboard) {
                        navigator.clipboard.writeText(pageUrl).then(done);
                    }
                });
                break;
        }
    });

    // --- Draft banner: show/hide the "needs checking" highlights ---
    const toggle = document.querySelector('[data-toggle-tbc]');
    if (toggle) {
        toggle.addEventListener('click', function () {
            const hidden = document.body.classList.toggle('hide-tbc');
            toggle.textContent = hidden ? 'Show highlights' : 'Hide highlights';
        });
    }
})();
