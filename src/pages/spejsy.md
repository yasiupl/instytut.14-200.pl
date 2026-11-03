---
title: "Co słychać w hakerspejsach"
description: "Najbliższe wydarzenia i nowe wpisy hakerspejsów z całej Polski: Warszawa, Kraków, Wrocław, Trójmiasto, Łódź, Poznań i inne."
date: "2026-11-03"
lang: "pl"
area: "pracownia"
permalink: "/spejsy/"
spejsyFeed: true
---

Hakerspejs to wspólna pracownia, w której ludzie razem budują, naprawiają, programują i uczą się od siebie. W Polsce działa ich kilkanaście. Nasza [pracownia politechniczna](/pracownia/) chce do nich dołączyć. Tu widać, co się u nich dzieje.

Wydarzenia pochodzą z kalendarzy zebranych na [hakerzy.info](https://hakerzy.info). Wpisy pochodzą z kont spejsów w [fediwersum](/fediverse/). Obie listy odświeżają się same.

{% set full = true %}
{% set postImages = true %}
{% include "partials/spejsy.njk" %}

## Hakerspejsy w Polsce

{% for s in spejsy %}
- [{{ s.name }}]({{ s.url }}) ({{ s.city }}){% if s.fediverse %} · fediwersum: [@{{ s.fediverse.user }}@{{ s.fediverse.host }}](https://{{ s.fediverse.host }}/@{{ s.fediverse.user }}){% endif %}
{%- endfor %}

Spejsy w Polsce nie są jedną organizacją, ale znają się i współpracują. Mają wspólny czat [międzyspejs](https://matrix.to/#/%23miedzyspejs:hackerspace.pl) i razem robią [Cebula Camp](https://cebula.camp).

## Skąd są dane

- Wpisy pobiera Twoja przeglądarka bezpośrednio z serwerów fediwersum, na których spejsy mają konta. Te serwery widzą Twój adres IP, tak jak przy każdym obrazku z innej strony.
- Kalendarze pobiera nasz serwer, raz na godzinę, bo większość serwisów z kalendarzami nie pozwala przeglądarce czytać ich z innej strony.
- Za treść wydarzeń i wpisów odpowiadają spejsy, które je opublikowały.
- Twój spejs nie jest na liście albo coś się nie zgadza? Napisz do nas: [{{ site.email }}](mailto:{{ site.email }}). Listę kalendarzy prowadzi [hakerzy.info](https://hakerzy.info).
