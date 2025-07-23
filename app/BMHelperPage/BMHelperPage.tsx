import React, {useState, useRef} from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import ContextMenu from "../BMDashboard/components/ContextMenu";

const faqs = [
  {
    question: "Kod SMS/Mail nie dochodzi",
    answer:
      <>
      <span className="font-semibold text-white">1)</span> Sprawdzamy poprawnosc danych ( bledy typu @gnail zamiast @gmail )<br />
      <span className="font-semibold text-white">2)</span> Dzwonimy do IT w celach weryfikacji dostepnosci oferty
      </>
  },
  {
    question: "Bledny kod MYGLO",
    answer:
      <>
        Wchodzimy w <span className="font-semibold text-white">Aplikacje121 - Wysylki - Zgloszenia BM</span> <br />
        W rodzaj zgloszenia klikamy 'Bledny numer myGLO', wpisujemy kod z urzadzdenia ktory nie przechodzi - po zatwierdzeniu strona wypisuje awaryjny kod urzadzenia ktory wpisujemy w webform
      </>
  },
  {
    question: "Blad przy konczeniu rejestracji",
    answer:
      <>
        Czasami gdy juz jest klient zweryfikowany, numery myGLO i oferta wpisane - podczas konczenia rejestracji nastapuje blad np. <span className="font-semibold text-white">"Wystapil blad podczas rejestracji. Zweryfikuj dane i sprobuj ponownie"</span> <br/>
        <br/><span className="font-semibold text-white">1) Zapisujemy dane klienta</span> czyli mail + nr telefonu <br />
        <span className="font-semibold text-white">2) Robimy zdjecie paragonu telefonem/tabletem</span> przyda sie przy wysylaniu zgloszenia <br />
        <span className="font-semibold text-white">3) Wchodzimy na "aplikacje121 / wysylki / zgloszenia BM</span> klikamy opcje 'Nowy' wybieramy rodzaj zgloszenia 'Blad systemu'<br />
        <span className="font-semibold text-white">4) Uzupelniamy formularz zgloszenia</span> wypelniamy event, kod bledu ( jesli go brak w powiadomieniu na tablecie to po prostu 'blad wysylania'), region, adres email, oferta oraz w <span className="font-semibold text-white">Uwagi opcjonalne dodajemy nr telefonu klienta</span><br />


      </>
  },
  {
    question: "Gdzie moge znalezc numer ackji?",
    answer:(
      <>
        W zakladce 'Akcje' w Tourplanner klikamy obecnie trwajaca akje, wtedy pod nazwa akcji mamy napisany 'ID akcji' bedzie wygladal jak 000000/A/2025, obchodzi nas jedynie poczatek czyli same 000000
      </>
    )
  },
  {
    question: "Klient ma wykorzystana oferte, czy moge na kasjerke?",
    answer:(
      <>
        Jest <span className="font-semibold text-white">ZAKAZ rejestrowania urzadzenia na kogos innego niz klient z ktorym rozmawiamy</span> natychmiastowy negatywny wynik u tajemniczego klienta. Nie boj sie wyblagac kasjerke o zrobienie zwrotu urzadzenia ktore klient kupil, lecz na przyszlosc <span className="font-semibold text-white"> wpierw nalezy weryfikowac dostepnosc ofert</span>
      </>
    )
  },
    {
    question: "Jaki wybrac event? Co to Traditional Trade",
    answer:
      <>
      W wiekszosci przypadkow nazwy sklepu w ktorym jestesmy wskazuja jaki event, lecz sa przypadki gdzie nie do konca <br/><br/>
      <span className="font-semibold text-white">Traditional Trade ( TT ) - </span> Sklepu typu carrefour express, kiosk u pani krysi - czyli sklepy niezalezne<br />
      </>
  },
];


export default function BMHelperPage() {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
    return (
        <>
            {/* Context menu button */}
            <div ref={menuRef} className="fixed top-4 right-4 z-50" onClick={(e) => e.stopPropagation()} >
                <button onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu" className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center focus:outline-none" type="button">
                <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                </button>
                {menuOpen && <ContextMenu closeMenu={() => setMenuOpen(false)} />}
            </div>
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white flex flex-col items-center p-4 sm:p-6">
      <div className="w-full max-w-sm sm:max-w-md mb-4 sm:mb-6">
        <h2 className="text-xl font-bold mb-4 text-white">Frequently Asked Questions</h2>
      </div>
      <div className="flex flex-col gap-4 sm:gap-6 max-w-sm sm:max-w-md w-full">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border border-gray-700 rounded-xl p-4 bg-gray-800/50 backdrop-blur-md shadow-lg"
          >
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value={`faq-${index}`}>
                <AccordionTrigger className="text-base font-medium text-white hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pt-2 text-sm text-gray-300">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        ))}
      </div>
    </div>
        </>
    )
}