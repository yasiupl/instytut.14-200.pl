---
title: Fediwersum
description: Jak obserwować Iławski Instytut Idei przez RSS, Mastodona i inne serwisy fediwersum.
layout: page.njk
permalink: /fediverse/
---

Nie musisz mieć Facebooka, żeby wiedzieć, co się u nas dzieje. Wybierz jeden z dwóch sposobów:

- **RSS** – czytasz nowe wpisy w aplikacji. Nie zakładasz żadnego konta.
- **Fediwersum (np. Mastodon)** – obserwujesz nas, komentujesz i udostępniasz wpisy. Potrzebujesz konta.

## Bez konta: kanał RSS

RSS to stary i prosty standard. Strona publikuje listę nowych wpisów, a aplikacja (czytnik RSS) co jakiś czas ją sprawdza. Nowe wpisy pojawiają się w czytniku same, bez reklam i bez algorytmu.

1. Zainstaluj czytnik RSS, na przykład:
   - Android: [Feeder](https://f-droid.org/packages/com.nononsenseapps.feeder/) (bezpłatny, otwarty),
   - iPhone, iPad i Mac: [NetNewsWire](https://netnewswire.com/) (bezpłatny, otwarty),
   - komputer: program pocztowy [Thunderbird](https://www.thunderbird.net/pl/) ma wbudowany czytnik,
   - przeglądarka: serwisy takie jak [Inoreader](https://www.inoreader.com/) lub [Feedly](https://feedly.com/).
2. Skopiuj adres naszego kanału:
   <p><code id="feed-url">{{ site.url }}/feed.xml</code> <button type="button" class="button plausible-event-name=Kanal+RSS+kopiuj" onclick="navigator.clipboard&&navigator.clipboard.writeText(document.getElementById('feed-url').textContent)">kopiuj</button></p>
3. W czytniku wybierz **Dodaj kanał** (często przycisk **+**) i wklej adres.

Większość czytników przyjmie też sam adres strony, `{{ site.url }}`, i znajdzie kanał automatycznie.

Kanał jest w dwóch formatach. Treść jest ta sama, wybierz ten, który obsługuje Twój czytnik:

- <a class="plausible-event-name=Kanal+RSS" href="/feed.xml">/feed.xml</a> (Atom, działa wszędzie)
- <a class="plausible-event-name=Kanal+JSON" href="/feed.json">/feed.json</a> (JSON Feed)

## Z kontem: Mastodon i fediwersum

{%- if not site.fediverse.active %}
<p class="status"><strong>W przygotowaniu.</strong> Konto <code>{{ site.fediverse.handle }}</code> jeszcze nie działa. Do tego czasu obserwuj nas przez RSS.</p>
{%- endif %}

[Fediwersum](https://pl.wikipedia.org/wiki/Fediwersum) to sieć niezależnych serwisów społecznościowych, które rozmawiają ze sobą przez protokół ActivityPub. Najbardziej znany z nich to Mastodon. Działa podobnie do poczty e-mail: konto zakładasz na jednym serwerze, a piszesz z osobami na wszystkich innych. Nikt nie jest właścicielem całej sieci.

Nasz adres w fediwersum:

<p><code id="handle">{{ site.fediverse.handle }}</code> <button type="button" class="button plausible-event-name=Fediwersum+kopiuj" onclick="navigator.clipboard&&navigator.clipboard.writeText(document.getElementById('handle').textContent)">kopiuj</button></p>

### Masz już konto?

Wklej nasz adres w wyszukiwarkę swojej aplikacji i kliknij **Obserwuj**. Działa to w Mastodonie, Pixelfedzie, Misskey i w innych serwisach fediwersum.

### Nie masz konta? Załóż je w kilka minut

1. **Wybierz serwer.** Lista serwerów jest na <a class="plausible-event-name=Mastodon+rejestracja" href="https://joinmastodon.org/servers">joinmastodon.org</a>. Wybierz język „polski” i poszukaj serwera, którego zasady Ci odpowiadają. Wybór nie jest ostateczny: później możesz przenieść konto na inny serwer razem z obserwującymi.
2. **Zainstaluj aplikację.** Oficjalna aplikacja Mastodon jest w [Google Play](https://play.google.com/store/apps/details?id=org.joinmastodon.android), na [F-Droid](https://f-droid.org/packages/org.joinmastodon.android/) i w [App Store](https://apps.apple.com/app/mastodon-for-iphone/id1571998974). Możesz też korzystać z Mastodona w przeglądarce, bez instalacji.
3. **Załóż konto.** W aplikacji wybierz serwer z punktu 1 i podaj adres e-mail, nazwę użytkownika i hasło. Przeczytaj i zaakceptuj zasady serwera.
4. **Potwierdź adres e-mail.** Otwórz wiadomość od serwera i kliknij link. Niektóre serwery dodatkowo sprawdzają nowe konta ręcznie. Wtedy na dostęp trzeba poczekać do kilku dni.
5. **Obserwuj nas.** Wklej `{{ site.fediverse.handle }}` w wyszukiwarkę i kliknij **Obserwuj**.

Twój pełny adres ma postać `@nazwa@serwer`. Podaj go znajomym, żeby mogli Cię obserwować z dowolnego serwera.

Jeśli wyszukiwarka nie znajdzie nas od razu, spróbuj ponownie po minucie. Serwer musi najpierw pobrać dane konta z innego serwera.

### Co dostaniesz

Każdy nowy wpis z [aktualności](/#news-title) pojawi się na Twojej osi czasu. Polubienia, udostępnienia i odpowiedzi wrócą pod wpis na naszej stronie jako webmentions.

## IndieWeb

Masz własną stronę? Możesz z nami rozmawiać bez żadnego serwisu.

- Każda podstrona ma znaczniki [microformats2](https://microformats.org/wiki/microformats2) (`h-card`, `h-entry`, `h-feed`).
- Przyjmujemy [webmentions](https://indieweb.org/Webmention): napisz o nas na swojej stronie, a odpowiedź pojawi się pod wpisem.
