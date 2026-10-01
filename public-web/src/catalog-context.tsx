import React from "react";
import {language,pageHref,preview} from "./lib/i18n";
const ru=language==="ru";
const t=(a:string,b:string)=>ru?a:b;
const params=new URLSearchParams(location.search);
export const catalogGoal=["rent","living","villas"].includes(params.get("goal")??"")?params.get("goal")!:"";
export const catalogType=params.has("type")?(["VILLA","CONDO"].includes(params.get("type")??"")?params.get("type")!:""):catalogGoal==="villas"?"VILLA":"";
export const catalogBudget=Number(params.get("budget"))>0?Number(params.get("budget")):null;
export const catalogSort=["price-asc","price-desc"].includes(params.get("sort")??"")?params.get("sort")!:"";
export function catalogHref(query="page=catalog"){
 const next=new URLSearchParams(query);
 if(preview){if(catalogGoal)next.set("goal",catalogGoal);if(catalogType||params.has("type"))next.set("type",catalogType);if(catalogBudget)next.set("budget",String(catalogBudget));if(catalogSort)next.set("sort",catalogSort)}
 return pageHref(next.toString());
}
export function catalogItems(items:any[]){
 const result=items.filter(item=>(!catalogType||item.propertyType===catalogType)&&(!catalogBudget||(typeof item.purchasePrice?.value==="number"&&item.purchasePrice.value<=catalogBudget)));
 if(catalogSort)result.sort((a,b)=>{const x=a.purchasePrice?.value,y=b.purchasePrice?.value;if(typeof x!=="number")return typeof y!=="number"?0:1;if(typeof y!=="number")return -1;return catalogSort==="price-asc"?x-y:y-x});
 return result;
}
export function CatalogControls(){return <section className="catalogControls"><div className="catalogContext"><div><span className="eyebrow">{t("ВАШ СЦЕНАРИЙ","YOUR GOAL")}</span><h2>{catalogGoal==="rent"?t("Для сдачи в аренду","For rental income"):catalogGoal==="living"?t("Для жизни","For living"):catalogGoal==="villas"?t("Виллы","Villas"):t("Все направления","All directions")}</h2></div>{catalogGoal&&<a href={pageHref(`page=${catalogGoal}`)}>{t("Вернуться к сценарию","Back to your goal")} ↗</a>}</div><p>{catalogGoal==="rent"?t("Сравнивайте чистый доход, расходы и условия управления. Наличие расчёта не означает рекомендацию к покупке.","Compare net income, expenses and management terms. A calculation is not a purchase recommendation."):catalogGoal==="living"?t("Проверяйте район, планировку, сроки передачи и расходы на содержание. Пригодность для вашей семьи требует отдельной оценки.","Review location, layout, handover timing and running costs. Suitability for your family needs a separate assessment."):t("Фильтр показывает тип недвижимости и цену. Все представленные здесь данные остаются демонстрационными.","Filters show property type and price. All data shown here remains illustrative.")}</p><form action="/" method="get"><input type="hidden" name="preview" value="1"/><input type="hidden" name="page" value="catalog"/>{!ru&&<input type="hidden" name="lang" value="en"/>}{catalogGoal&&<input type="hidden" name="goal" value={catalogGoal}/>}<label>{t("Тип недвижимости","Property type")}<select name="type" defaultValue={catalogType}><option value="">{t("Все типы","All types")}</option><option value="CONDO">{t("Квартиры и апартаменты","Apartments")}</option><option value="VILLA">{t("Виллы","Villas")}</option></select></label><label>{t("Бюджет до, THB","Maximum price, THB")}<input name="budget" type="number" min="1" step="1" placeholder={t("Без ограничения","No limit")} defaultValue={catalogBudget??""}/></label><label>{t("Порядок","Order")}<select name="sort" defaultValue={catalogSort}><option value="">{t("Исходный порядок","Default order")}</option><option value="price-asc">{t("Сначала дешевле","Price: low to high")}</option><option value="price-desc">{t("Сначала дороже","Price: high to low")}</option></select></label><button type="submit">{t("Показать","Show results")} →</button><a href={pageHref("page=catalog")}>{t("Сбросить","Reset")}</a></form></section>}
