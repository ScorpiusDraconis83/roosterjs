/**
 * Add an unique id to element and ensure that is unique
 * @param el The HTMLElement that will receive the id
 * @param idPrefix The prefix that will antecede the id (Ex: tableSelected01)
 */
export function ensureUniqueId(el: HTMLElement, idPrefix: string) {
    const doc = el.ownerDocument;

    if (!el.id) {
        let cont = 0;
        const getElement = () => doc.getElementById(idPrefix + cont);
        //Ensure that there are no elements with the same ID
        let element = getElement();
        while (element) {
            cont++;
            element = getElement();
        }

        el.id = idPrefix + cont;
    } else {
        const elements = doc.querySelectorAll(`#${el.id}`);
        if (elements.length > 1) {
            el.removeAttribute('id');
            ensureUniqueId(el, idPrefix);
        }
    }
}
