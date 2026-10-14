---
title: Fediwersum
description: Jak obserwować Iławski Instytut Idei przez ActivityPub, RSS i IndieWeb.
layout: page.njk
permalink: /fediverse/
---

Nie musisz mieć Facebooka, żeby wiedzieć, co się u nas dzieje.

## Mastodon, Pixelfed, Misskey…

{%- if not site.fediverse.active %}
<p class="status"><strong>W przygotowaniu.</strong> Konto <code>{{ site.fediverse.handle }}</code> powstaje na serwerze społeczności <a href="https://14-200.pl">14-200.pl</a>. Do tego czasu obserwuj nas przez RSS.</p>
{%- endif %}

Instytut będzie dostępny w [fediwersum](https://pl.wikipedia.org/wiki/Fediwersum) przez protokół ActivityPub. Wyszukaj w swojej aplikacji:

<p><code id="handle">{{ site.fediverse.handle }}</code> <button type="button" class="button" onclick="navigator.clipboard&&navigator.clipboard.writeText(document.getElementById('handle').textContent)">kopiuj</button></p>

i kliknij **Obserwuj**. Każdy nowy wpis z [aktualności](/#news-title) pojawi się na Twojej osi czasu, a polubienia i odpowiedzi wrócą pod wpis jako webmentions.

## RSS / Atom / JSON Feed

- [/feed.xml](/feed.xml) (Atom)
- [/feed.json](/feed.json) (JSON Feed)

## IndieWeb

- Każda podstrona ma znaczniki [microformats2](https://microformats.org/wiki/microformats2) (`h-card`, `h-entry`, `h-feed`).
- Przyjmujemy [webmentions](https://indieweb.org/Webmention): napisz o nas na swojej stronie, a odpowiedź pojawi się pod wpisem.
