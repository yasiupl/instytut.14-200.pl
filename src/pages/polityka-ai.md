---
title: "Polityka wykorzystania AI"
description: "Jak Iławski Instytut Idei korzysta z narzędzi sztucznej inteligencji: człowiek tworzy, AI pomaga się uczyć, a treści z udziałem AI są jasno oznaczone."
summary: "Człowiek tworzy, AI pomaga się uczyć. Każda treść z udziałem AI jest oznaczona."
date: "2026-10-19"
lang: "pl"
permalink: "/polityka-ai/"
ai: redakcja
ai_note: "Zasady to umowa społeczności Instytutu: omawiamy je i przyjmujemy wspólnie. Narzędzie AI (Claude) pomogło je spisać i zredagować."
---

Korzystamy z narzędzi sztucznej inteligencji: przy pisaniu tekstów, tłumaczeniach, programowaniu i przygotowaniu zajęć. Ta strona mówi, na jakich zasadach to robimy i jak oznaczamy treści, przy których pomagało AI.

Te zasady są umową społeczną: omawiamy je wspólnie z osobami, które tworzą Instytut, i przyjmujemy jako naszą wspólną wolę. Przy spisaniu i redakcji tekstu pomagało AI, dlatego na górze strony jest oznaczenie.

<p class="status"><strong>Projekt do dyskusji.</strong> Ta wersja czeka na omówienie ze społecznością. Uwagi wyślij na <a href="mailto:{{ site.email }}">{{ site.email }}</a> albo przynieś na najbliższe spotkanie.</p>

## Pięć zasad

**1. Najpierw człowiek.** Pomysły, pytania badawcze, projekty, obserwacje i wnioski pochodzą od ludzi. Na zajęciach w [laboratorium](/laboratorium/) i [pracowni](/pracownia/) liczy się to, co uczestnik sam wymyśli, zbuduje i zmierzy. Narzędzie może być sprawne, ale nie zastąpi ciekawości, wyobraźni ani pracy rąk.

**2. AI pomaga się uczyć, a nie wyręcza.** Dobrze użyte AI tłumaczy trudne pojęcie na kilka sposobów, podpowiada, gdzie szukać błędu w kodzie, pomaga zaplanować eksperyment albo przećwiczyć rozmowę po angielsku. Źle użyte robi zadanie za kogoś i odbiera mu to, po co przyszedł. Pytamy więc nie „czy wolno użyć AI”, tylko „czy dzięki temu ktoś nauczył się więcej”.

**3. Dane to nie wiedza.** Model językowy zna mnóstwo tekstów, ale nie rozumie świata tak jak człowiek i potrafi się mylić z pełnym przekonaniem. Wszystko, co podaje AI, sprawdzamy w źródłach, w pomiarach albo u ludzi, którzy się na tym znają. Uczymy też tego uczestników: zadawać pytania, porównywać źródła, nie wierzyć na słowo ani ludziom, ani maszynom.

**4. Jawnie.** Treść, przy której AI zrobiło coś więcej niż poprawienie literówek, oznaczamy (szczegóły niżej). Czytelnik ma prawo wiedzieć, z czym ma do czynienia.

**5. Odpowiedzialność zostaje u ludzi.** Pod każdym tekstem i każdą decyzją podpisuje się człowiek. Jeśli w oznaczonej treści jest błąd, to jest nasz błąd, nie „błąd AI”, i to my go poprawiamy.

## Dzieci, młodzież i prywatność

Dużą część naszych uczestników stanowią dzieci i młodzież, więc tu jesteśmy szczególnie ostrożni.

- Do narzędzi AI nie wpisujemy danych osobowych uczestników: imion i nazwisk, adresów e-mail, numerów telefonów, ocen ani informacji o zdrowiu.
- Nie przetwarzamy przez AI zdjęć ani nagrań z wizerunkiem uczestników.
- Gdy na zajęciach korzystamy z AI, robimy to razem z prowadzącym i rozmawiamy o tym, jak takie narzędzia działają, kto je tworzy i na czym zarabia, i czym jest „pewna siebie” odpowiedź, która okazuje się zmyślona.
- AI nie zastępuje rozmowy z drugim człowiekiem. Pytania, wątpliwości i spory rozwiązujemy wspólnie.

## Na zajęciach

Uczestnicy mogą korzystać z AI jako pomocy: do wyjaśnienia pojęcia, znalezienia błędu, podsunięcia pomysłu na dalszy krok. Mają przy tym trzy zobowiązania:

1. **Hipotezy, obserwacje, pomiary i wnioski są własne.** Wyników doświadczeń nie generujemy ani nie „poprawiamy”. Nieudany pomiar też jest wynikiem.
2. **Mówimy, w czym pomogło AI.** Wystarczy jedno zdanie w notatkach albo w opisie projektu, np. „AI pomogło mi znaleźć błąd w pętli”.
3. **Rozumiemy to, co oddajemy.** Jeśli nie potrafisz wytłumaczyć fragmentu kodu albo tekstu, to jeszcze nie jest twoja praca.

## Jak oznaczamy treści na tej stronie

Wpis lub strona z udziałem AI ma na górze ramkę z przerywaną linią i jeden z trzech poziomów:

{%- for key, l in site.ai.levels %}
- **{{ l.label }}**: {{ l.text }}
{%- endfor %}

Ramka może też krótko mówić, co dokładnie zrobiło AI. Na liście wpisów takie teksty mają znaczek <span class="ai-tag">AI</span>. Oznaczenie trafia też do kanałów RSS i JSON Feed.

Pojedynczy fragment w tekście napisanym przez człowieka wygląda tak:

{% ai "tłumaczenie z angielskiego, sprawdzone ręcznie" %}
Przykład: ten akapit jest oznaczony jako fragment przygotowany z pomocą AI.
{% endai %}

Nie oznaczamy drobnej korekty pisowni i interpunkcji ani podpowiedzi w edytorze kodu, tak jak nikt nie oznacza użycia słownika.

### Obrazy

Nie publikujemy obrazów wygenerowanych przez AI, które udają zdjęcia z naszych wydarzeń, ludzi albo przyrody. Dokumentacja jest prawdziwa albo jej nie ma. Jeśli użyjemy grafiki z AI jako ilustracji, podpis to powie.

## Skąd te zasady

Punktem wyjścia była dla nas encyklika [*Magnifica humanitas*](https://www.vatican.va/content/leo-xiv/en/encyclicals/documents/20260515-magnifica-humanitas.html) papieża Leona XIV (maj 2026) i jego [przesłanie o AI i młodych ludziach](https://www.vaticannews.va/en/pope/news/2025-06/pope-leo-on-ai-exceptional-tool-but-cannot-forget-human-dignity.html) z czerwca 2025 roku. Jesteśmy organizacją świecką, więc nie przenosimy z nich argumentów religijnych. Bierzemy myśli, pod którymi może się podpisać każdy, niezależnie od światopoglądu:

- **AI jest narzędziem**, a narzędzie służy człowiekowi, nie odwrotnie.
- **Technologia nie jest neutralna**: przejmuje cechy tych, którzy ją tworzą, finansują i używają. Dlatego warto wiedzieć, jak działa i kto za nią stoi.
- **Dostęp do danych to jeszcze nie mądrość.** Rozumienie, ocena i sens to zadania człowieka.
- **Młodym ludziom technologia ma pomagać dojrzewać, a nie w tym przeszkadzać.** Nie może gasić chęci zadawania pytań ani wmawiać, że własne myślenie jest zbędne.
- **Przejrzystość i odpowiedzialność**: ludzie mają prawo wiedzieć, kiedy mają do czynienia z maszyną, a ktoś konkretny odpowiada za skutki.
- **Dobro wspólne**: narzędzia mają łączyć ludzi i służyć społeczności, a nie uzależniać czy zamykać w bańce.

## Zmiany

To żywy dokument. Narzędzia zmieniają się szybko i nasze zasady też będą się zmieniać. Każdą zmianę omawiamy i przyjmujemy wspólnie, tak jak pierwszą wersję. Propozycje zmian: [{{ site.email }}](mailto:{{ site.email }}).

<p class="small">Ostatnia zmiana: 19 października 2026.</p>
