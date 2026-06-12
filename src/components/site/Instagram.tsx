import { Instagram as IgIcon } from "lucide-react";
import g1 from "@/assets/gallery-1.jpg";
import g2 from "@/assets/gallery-2.jpg";
import g3 from "@/assets/gallery-3.jpg";
import g4 from "@/assets/gallery-4.jpg";
import g5 from "@/assets/gallery-5.jpg";
import g6 from "@/assets/gallery-6.jpg";
import g7 from "@/assets/gallery-7.jpg";

const imgs = [g1, g2, g3, g4, g5, g6, g7];

export function InstagramStrip() {
  return (
    <section className="bg-forest text-forest-foreground py-6">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-col lg:flex-row items-center gap-6">
        <div className="flex items-center gap-4 shrink-0 lg:w-64">
          <IgIcon className="w-8 h-8" strokeWidth={1.2} />
          <div>
            <p className="text-[11px] tracking-[0.25em] uppercase">Follow Our Journeys</p>
            <p className="text-sm text-forest-foreground/80">@thebaobabcollective</p>
          </div>
        </div>
        <div className="flex-1 flex gap-2 overflow-x-auto lg:overflow-visible">
          {imgs.map((src, i) => (
            <a
              key={i}
              href="#"
              className="shrink-0 w-20 h-20 md:w-24 md:h-24 overflow-hidden block"
            >
              <img
                src={src}
                alt=""
                loading="lazy"
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
