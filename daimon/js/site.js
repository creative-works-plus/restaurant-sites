/* 焼肉 大門 ── 3ページ共通のスクリプト（index.html / menu.html / drink.html）
   ★ここ1か所を直せば3ページとも変わる。ページごとにコピーを作らないこと。 */
/* JS が動いた印。CSSの .no-js .reveal が外れて出現演出が有効になる */
document.body.classList.remove('no-js');


/* --------------------------------------------------------------------------
   1. ヘッダー縮小・追従予約バーの表示切り替え
   ヒーローを6割スクロールしたら下のバーをせり上げる
   -------------------------------------------------------------------------- */
var heroEl = document.getElementById('hero');
var stickyBar = document.getElementById('sticky-bar');

/* ★お品書きサブナビの引っ込め（2026-08-10 追加）
   04-base.css は前から `.subnav.is-past` を用意していたのに、こちら側に
   付け外しの実装が無かった＝骨格ライブラリの穴。そのため `position: sticky` の
   効き目が文書の最後まで続き、お品書きを通り過ぎたあとも
   お客様の声・アクセス・フッターの上に帯が貼り付いたままになっていた
   （こびとカフェで発覚 → ゆるりの森でレビュアー3人が独立に再指摘）。
   最後の `.menu-block` の下端が帯の高さより上に抜けたら引っ込める。 */
var subnavEl = document.querySelector('.subnav');
/* 章立ての箱の呼び名は店によって .menu-block だったり .menu-section だったりする（竜美亭）。
   両方拾う。どちらも無い店＝帯が「お食事／お飲み物」のページ切替（玖・源氏）なので、
   これは通り過ぎても引っ込めない（引っ込めると行き先が消える）。 */
var menuBlocks = document.querySelectorAll('.menu-block, .menu-section');
var lastMenuBlock = menuBlocks.length ? menuBlocks[menuBlocks.length - 1] : null;

window.addEventListener('scroll', function () {
    var y = window.scrollY;
    document.body.classList.toggle('scrolled', y > 60);
    if (stickyBar) {
        var heroBottom = heroEl ? heroEl.offsetTop + heroEl.offsetHeight : 400;
        stickyBar.classList.toggle('visible', y > heroBottom * 0.6);
    }
    if (subnavEl && lastMenuBlock) {
        /* ★2026-08-11 追記：画面幅によって帯を追従させない店がある
           （PCでは position: static に戻す作りが既存店に複数あった）。
           追従していないのに引っ込めると、ただ消えるだけの帯になるので何もしない。 */
        if (window.getComputedStyle(subnavEl).position !== 'sticky') {
            subnavEl.classList.remove('is-past');
        } else {
            var r = lastMenuBlock.getBoundingClientRect();
            subnavEl.classList.toggle('is-past', r.bottom < subnavEl.offsetHeight + 8);
        }
    }
}, { passive: true });


/* --------------------------------------------------------------------------
   1-b. ハンバーガーを開いたときの横ずれ止め
   開いている間は body を overflow:hidden にして背面を止めるが、そのとき
   縦スクロールバーが消え、**ページ全体が数px横に動いて見える**。
   scrollbar-gutter に対応していないブラウザのために、消える幅をここで測って
   CSS変数 --sbw に入れる（CSS側がその幅だけ内側に寄せる）。
   -------------------------------------------------------------------------- */
if (!(window.CSS && CSS.supports && CSS.supports('scrollbar-gutter', 'stable'))) {
    var sbw = window.innerWidth - document.documentElement.clientWidth;
    if (sbw > 0) document.documentElement.style.setProperty('--sbw', sbw + 'px');
}


/* --------------------------------------------------------------------------
   2. モバイルナビ開閉
   閉じ方は必ず4通り用意する（どれか1つでも欠けると「開いたら戻せない」事故になる）
   ①ハンバーガー再タップ ②メニュー内のリンク ③背景（オーバーレイ）タップ ④Escキー
   -------------------------------------------------------------------------- */
var navToggle = document.getElementById('nav-toggle');
var navPanel = document.getElementById('mobile-nav');
function closeNav() {
    document.body.classList.remove('nav-open');
    if (navToggle) {
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'メニューを開く');
    }
}
if (navToggle) {
    navToggle.addEventListener('click', function (e) {
        // ③の document クリックに拾われて即閉じるのを防ぐ
        e.stopPropagation();
        var open = document.body.classList.toggle('nav-open');
        navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        navToggle.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    });
}
document.querySelectorAll('[data-nav-link]').forEach(function (a) {
    a.addEventListener('click', closeNav);
});
var navClose = document.getElementById('nav-close');
if (navClose) {
    navClose.addEventListener('click', function () {
        closeNav();
        if (navToggle) navToggle.focus();
    });
}
document.addEventListener('click', function (e) {
    if (!document.body.classList.contains('nav-open')) return;
    if (navPanel && navPanel.contains(e.target)) return;
    if (navToggle && navToggle.contains(e.target)) return;
    closeNav();
});
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeNav();
});


/* --------------------------------------------------------------------------
   3. スクロール出現演出（IntersectionObserver）
   .reveal を付けた要素が画面に入ったら .in-view を付ける。
   動きを減らす設定・IE等の非対応環境では最初から表示済みにする
   （＝コンテンツが永久に見えない事故を防ぐ）
   -------------------------------------------------------------------------- */
var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var revealEls = document.querySelectorAll('.reveal');
if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
} else {
    var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
}


/* --------------------------------------------------------------------------
   4. 営業状況バッジ
   ★ここだけ店ごとに書き換える★

   【A】全曜日おなじ営業時間の店（既存11店はこちら）
   closedDays … 定休日。0=日 1=月 2=火 3=水 4=木 5=金 6=土（複数可 [2,3]）
   shifts     … 営業時間帯。分に直して書く（17:00 → 17*60）
                通し営業なら1つ、昼夜2部制なら2つ書く
                翌0:00まで＝24*60、翌1:00まで＝25*60

   【B】曜日で営業時間が変わる店（例：火曜だけ夜のみ／ランチは水〜土だけ）
   shiftsByDay … 曜日番号 → その日のシフト配列。空配列＝定休日。
                 これを書いた場合 closedDays / shifts は無視される。
                 ★【A】だけの店の挙動は変わらないので、既存サイトの書き換えは不要。

   closedText … 定休日に出す文言（任意）。既定は「本日は定休日です」。
                「祝日は営業する」等の例外がある店は必ず上書きすること。
                祝日カレンダーを持てないので「定休日です」と断言すると
                一番来てほしい祝日に「休み」と表示してしまう（魚かつで発覚）。
   -------------------------------------------------------------------------- */
var BUSINESS = {
    closedDays: [2],   // 火曜は毎週定休
    shifts: [
        { open: 11 * 60 + 30, close: 14 * 60, label: '11:30〜14:00' },
        { open: 17 * 60, close: 21 * 60 + 30, label: '17:00〜21:30' }
    ],
    closedText: '本日は定休日です（火曜・第1,3,5水曜）'
};

/* その日のシフト配列を返す。
   ★大門は「火曜は毎週」「水曜は第1・第3・第5だけ」という変則的な定休日なので、
     【A】の closedDays だけでは表現できない。第何週の水曜かをここで計算して足す。 */
function isNthOddWednesday(date) {
    if (date.getDay() !== 3) return false;
    var nth = Math.floor((date.getDate() - 1) / 7) + 1;
    return nth === 1 || nth === 3 || nth === 5;
}
function shiftsForToday(date) {
    var day = date.getDay();
    if (BUSINESS.closedDays.indexOf(day) !== -1) return [];
    if (isNthOddWednesday(date)) return [];
    return BUSINESS.shifts;
}

function updateStatus() {
    var el = document.getElementById('status-chip');
    if (!el) return;
    var now = new Date();
    var minutes = now.getHours() * 60 + now.getMinutes();
    var shifts = shiftsForToday(now);
    var cls = '', text = '';

    if (!shifts.length) {
        cls = 'is-closed';
        text = BUSINESS.closedText || '本日は定休日です';
    } else {
        var inShift = null;
        for (var i = 0; i < shifts.length; i++) {
            var s = shifts[i];
            if (minutes >= s.open && minutes < s.close) { inShift = s; break; }
        }
        if (inShift) {
            cls = 'is-open'; text = 'ただいま営業中 ' + inShift.label;
        } else if (minutes < shifts[0].open) {
            text = '本日 ' + shifts[0].label + ' 営業';
        } else if (shifts[1] && minutes < shifts[1].open) {
            cls = 'is-break';
            text = '休憩中（' + shifts[1].label + ' 営業）';
        } else {
            cls = 'is-closed'; text = '本日の営業は終了しました';
        }
    }
    el.className = 'status-chip' + (cls ? ' ' + cls : '');
    el.querySelector('.status-text').textContent = text;
}
updateStatus();
setInterval(updateStatus, 60000);
