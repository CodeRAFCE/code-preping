// ============================================================
// EVENT BUBBLING, CAPTURING, PROPAGATION & DELEGATION
// ============================================================
//
// THE DOM EVENT PHASES:
//   When you click an element nested inside other elements, the event
//   doesn't just fire on that one element — it travels through the DOM
//   tree in THREE phases:
//
//   1. CAPTURING PHASE (top → down):
//      The event travels FROM the window DOWN to the target element.
//      Listeners registered with { capture: true } (or 3rd arg = true) fire here.
//
//   2. TARGET PHASE:
//      The event reaches the actual element that was clicked.
//
//   3. BUBBLING PHASE (bottom → up):
//      The event "bubbles" back UP from the target to the window.
//      Listeners registered with { capture: false } (default) fire here.
//
// addEventListener(event, handler, useCapture)
//   useCapture = false (default) → fires during BUBBLING phase
//   useCapture = true            → fires during CAPTURING phase
//
// event.stopPropagation()
//   Stops the event from traveling further up (bubbling) or down (capturing).
//   Useful to prevent parent listeners from firing when a child is clicked.
//
// EVENT DELEGATION:
//   Instead of attaching a listener to EVERY child element,
//   attach ONE listener to a PARENT. Child events bubble up to it.
//   Benefits:
//     - Better performance (fewer listeners)
//     - Works for dynamically added children (no need to re-attach)
//   Use event.target to identify which child was actually clicked.
// ============================================================

const grandparent = document.querySelector("#grandparent")
const parent = document.querySelector("#parent")
const child = document.querySelector("#child")

// -------------------------------------------------------
// BUBBLING (default — third arg false or omitted)
// -------------------------------------------------------
// When 'child' is clicked, the click event bubbles UP:
// child → parent → grandparent
//
// Output order:
//   "Child clicked"
//   "Parent clicked"
//   "Grandparent clicked"
//
// 'false' is the default for the 3rd argument, so it's redundant here.

grandparent.addEventListener("click", (event) => {
    console.log("Grandparent clicked")
}, false)

parent.addEventListener("click", (event) => {
    console.log("Parent clicked")
}, false)

child.addEventListener("click", (event) => {
    console.log("Child clicked")
}, false)

// -------------------------------------------------------
// CAPTURING (third arg = true)
// -------------------------------------------------------
// Event travels DOWN from grandparent to child.
// Listeners with 'true' fire in top-down order.
//
// Grandparent (true) → fires first
// Parent (false)     → NOT in capturing, fires during bubbling
// Child (true)       → fires second (target phase, capture side)
//
// Output order:
//   "Grandparent clicked"
//   "Parent clicked"    ← actually fires during bubbling after target
//   "Child clicked"

// grandparent.addEventListener("click", (event) => {
//     console.log("Grandparent clicked")
// }, true)

// parent.addEventListener("click", (event) => {
//     console.log("Parent clicked")
// }, false)

// child.addEventListener("click", (event) => {
//     console.log("Child clicked")
// }, true)

// -------------------------------------------------------
// STOPPING PROPAGATION
// -------------------------------------------------------
// Without stopPropagation(), clicking 'child' fires all three handlers.
// This has a performance/logic cost when many nested listeners exist.
// event.stopPropagation() in 'child' prevents the event from bubbling
// to parent or grandparent handlers.
//
// Output: ONLY "Child clicked"

// grandparent.addEventListener("click", (event) => {
//     console.log("Grandparent clicked")
// }, false)

// parent.addEventListener("click", (event) => {
//     console.log("Parent clicked")
// }, false)

// child.addEventListener("click", (event) => {
//     console.log("Child clicked")
//     event.stopPropagation();   // ← bubble stops here
// }, false)

// -------------------------------------------------------
// EVENT DELEGATION — Single listener on parent
// -------------------------------------------------------
// CONCEPT:
//   Attach one click listener on the '#category' element (a <ul> or <div>).
//   When any <li> inside it is clicked, the click bubbles up to #category.
//   We use event.target to determine which <li> was actually clicked.
//
// WORKFLOW:
//   User clicks <li id="electronics">
//   → click bubbles from <li> up to #category
//   → listener fires: event.target = the <li> element
//   → event.target.tagName === "LI" check passes
//   → window.location.href = "/electronics"
//
// WHY CHECK tagName?
//   The listener is on the parent, so event.target could be any descendant.
//   The tagName guard ensures we only react to LI clicks, not the container itself.

// **Event Delegation**

// Instead of writing event listener on all the child elements, we can write event listener on the parent element.
// When the event occurs on the child element, it will bubble up to the parent element and the event listener will be triggered.
// This improves the performance of the application.
// This is also useful when the child elements are dynamically added to the DOM.

// document.querySelector("#category").addEventListener("click", (event) => {
//     console.log("Category clicked")
//     console.log(event.target.id)
//     Here we are using event.target.tagName to check if the clicked element is a LI element.
//     This is because the event is triggered on the parent element, but we only want to perform
//     an action if the clicked element is a LI element.
//     if (event.target.tagName === "LI") {
//         window.location.href = "/" + event.target.id;
//     }
// })

// -------------------------------------------------------
// REAL WORLD EVENT DELEGATION — Form Auto-Uppercase
// -------------------------------------------------------
// CONCEPT: data-* attributes
//   HTML elements can carry custom metadata via data-* attributes.
//   e.g. <input data-uppercase> marks this input for auto-uppercasing.
//   Accessed in JS via element.dataset.uppercase.
//
// One 'keyup' listener on the '#form' container handles ALL inputs inside it.
// When any key is released, the event bubbles to #form.
// We check: does the element that triggered the event have 'data-uppercase'?
//   - dataset.uppercase !== undefined → yes, it has the attribute → uppercase the value
//   - Otherwise → leave other inputs untouched
//
// WORKFLOW:
//   User types "hello" into <input data-uppercase>
//   → 'keyup' fires on input, bubbles to #form
//   → event.target = the input element
//   → event.target.dataset.uppercase !== undefined → true
//   → event.target.value = "HELLO"
//
// This pattern scales — adding more inputs to the form requires
// no new JS, just adding 'data-uppercase' to the HTML attribute.

document.querySelector("#form").addEventListener("keyup", (event) => {
    console.log(event)
    if (event.target.dataset.uppercase !== undefined)
        event.target.value = event.target.value.toUpperCase()
})
