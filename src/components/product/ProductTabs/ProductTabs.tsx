"use client";

import { useState } from "react";
import clsx from "clsx";
import { useTranslations } from "next-intl";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { name: string | null };
}

interface ProductTabsProps {
  description?: string | null;
  characteristics?: Record<string, Record<string, string>> | null;
  reviews: Review[];
}

function countCharacteristics(chars: Record<string, Record<string, string>>): number {
  return Object.values(chars).reduce((sum, group) => sum + Object.keys(group).length, 0);
}

export function ProductTabs({ description, characteristics, reviews }: ProductTabsProps) {
  const t = useTranslations("product");
  const [activeTab, setActiveTab] = useState<"description" | "characteristics" | "reviews">("description");

  const groups = characteristics ? Object.entries(characteristics) : [];
  const totalCharCount = characteristics ? countCharacteristics(characteristics) : 0;
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const tabClass = (active: boolean) =>
    clsx(
      "-mb-0.5 flex-shrink-0 whitespace-nowrap border-b-2 px-4 py-3.5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 sm:px-7 sm:py-4 sm:text-[0.9375rem]",
      active ? "border-accent text-accent" : "border-transparent text-muted hover:text-ink",
    );

  const noContentClass = "py-8 text-center text-[0.9375rem] text-subtle";

  return (
    <div className="mt-8 md:mt-12">
      <div className="flex gap-0 overflow-x-auto border-b-2 border-line [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="tablist">
        <button
          className={tabClass(activeTab === "description")}
          onClick={() => setActiveTab("description")}
          role="tab"
          aria-selected={activeTab === "description"}
        >
          {t("description")}
        </button>
        <button
          className={tabClass(activeTab === "characteristics")}
          onClick={() => setActiveTab("characteristics")}
          role="tab"
          aria-selected={activeTab === "characteristics"}
        >
          {t("characteristics")}
          {totalCharCount > 0 && (
            <span className="ml-1 text-xs font-normal text-subtle">({totalCharCount})</span>
          )}
        </button>
        <button
          className={tabClass(activeTab === "reviews")}
          onClick={() => setActiveTab("reviews")}
          role="tab"
          aria-selected={activeTab === "reviews"}
        >
          {t("reviews", { count: reviews.length })}
        </button>
      </div>

      <div className="py-5 sm:py-8" role="tabpanel">
        {activeTab === "description" && (
          description ? (
            <div className="max-w-[80ch] text-[0.9375rem] leading-[1.8] text-muted [&>p]:mb-4">
              {description.split("\n").map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          ) : (
            <p className={noContentClass}>-</p>
          )
        )}

        {activeTab === "characteristics" && (
          groups.length > 0 ? (
            <div className="grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2">
              {groups.map(([groupName, entries]) => (
                <div key={groupName} className="flex flex-col">
                  <h3 className="mb-3 border-b-2 border-line pb-2 text-[1.0625rem] font-extrabold text-ink">{groupName}</h3>
                  <table className="w-full border-collapse">
                    <tbody>
                      {Object.entries(entries).map(([key, value]) => (
                        <tr key={key} className="even:bg-mist">
                          <td className="w-[55%] border-b border-line px-3 py-2.5 align-top text-sm font-normal text-muted">{key}</td>
                          <td className="border-b border-line px-3 py-2.5 align-top text-sm font-bold text-ink">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          ) : (
            <p className={noContentClass}>-</p>
          )
        )}

        {activeTab === "reviews" && (
          reviews.length > 0 ? (
            <>
              <div className="mb-6 flex items-center gap-8 rounded-xl bg-mist p-5 sm:p-6">
                <div className="text-center">
                  <div className="text-[2rem] font-extrabold leading-none text-ink sm:text-[2.5rem]">{avgRating.toFixed(1)}</div>
                  <div className="mt-1 text-lg text-warning">
                    {"★".repeat(Math.round(avgRating))}{"☆".repeat(5 - Math.round(avgRating))}
                  </div>
                  <div className="mt-1 text-[0.8125rem] text-subtle">{reviews.length} {t("reviews", { count: reviews.length }).toLowerCase().replace(/\(\d+\)/, "").trim()}</div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
                {reviews.map((review) => (
                  <div key={review.id} className="rounded-xl border border-line bg-surface p-5 transition-shadow duration-200 hover:shadow-md sm:p-6">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-[0.9375rem] font-bold text-ink">
                        {review.user.name || "Anonymous"}
                      </span>
                      <span className="text-sm tracking-[1px] text-warning">
                        {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-sm leading-[1.65] text-muted">{review.comment}</p>
                    )}
                    <div className="mt-3 text-xs text-subtle">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className={noContentClass}>{t("noReviews")}</p>
          )
        )}
      </div>
    </div>
  );
}
