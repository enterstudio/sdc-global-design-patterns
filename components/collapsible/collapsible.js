import {forEach} from 'lodash'
import domready from '../../assets/js/domready';
import {trackEvent} from '../../assets/js/analytics';

export const classHasJs = 'has-js'
export const classCollapsible = 'js-collapsible'
export const classCollapsibleSimple = 'js-collapsible-simple'
export const classCollapsibleContent = 'js-collapsible-content'
export const classCollapsibleTitle = 'js-collapsible-title'
export const classCollapsibleBody = 'js-collapsible-body'
export const classExpanded = 'is-expanded'
export const classToggle = 'js-collapsible-toggle'
export const classCollapsibleToggleAll = 'js-collapsible-toggle-all'
export const classClose = 'js-collapsible-close'

export const attrHidden = 'aria-hidden'
export const attrExpanded = 'aria-expanded'
export const attrMultiselectable = 'aria-multiselectable'
export const attrControls = 'aria-controls'
export const attrSelected = 'aria-selected'

class Collapsible {
  constructor(trackEvent) {
    this.trackEvent = trackEvent
    this.openItems = 0
  }

  registerDom(rootEl) {
    rootEl.classList.add(classHasJs)
    const content = rootEl.getElementsByClassName(classCollapsibleContent)[0]
    const category =  rootEl.getAttribute('data-js-collapsible-event-category')

    rootEl.classList.contains(classCollapsibleSimple) ? this.multi = false : this.multi = true
    
    this.titles = forEach(
      rootEl.getElementsByClassName(classCollapsibleTitle),
      (el, index) => { this.registerTitle(el, index, category) }
    )

    this.bodys = forEach(
      rootEl.getElementsByClassName(classCollapsibleBody),
      (el, index) => { this.registerBody(el, index) }
    )

    this.toggleAllTrigger = forEach(
      rootEl.getElementsByClassName(classCollapsibleToggleAll),
      el => { this.registerToggleAll(el, category) }
    )

    this.closeTrigger = forEach(
      rootEl.getElementsByClassName(classClose),
      el => { this.registerClose(el, category) }
    )

    if (!this.multi) {
      forEach(this.titles, el => { el.setAttribute('tabindex', '0') })
    } else {
      content.setAttribute(attrMultiselectable, 'true')
      content.setAttribute('role', 'tablist')
    }
  }

  registerTitle(element, index, category) {
    // Better screen reader interaction
    element.setAttribute('id', 'collapsible-title-' + index)
    element.setAttribute(attrControls, 'collapsible-body-' + index)
    element.setAttribute(attrExpanded, 'false')
    element.setAttribute(attrSelected, 'false')

    if (element.classList.contains(classExpanded)) {
      element.setAttribute(attrExpanded, 'true')
      this.openItems += 1
    }

    if (this.multi) {
      element.setAttribute('role', 'tab')
    }

    element.addEventListener('click', e => {
      e.preventDefault()
      this.toggle(element, category)
    })

    element.addEventListener('keydown', e => {
      this.keyboardInteraction(element, e)
    })
  }

  registerBody(element, index) {
    // Better screen reader interaction
    element.setAttribute('id', 'collapsible-body-' + index)
    element.setAttribute('aria-labelledby', 'collapsible-title-' + index)
    element.setAttribute(attrHidden, 'true')

    if (this.multi) {
      element.setAttribute('role', 'tabpanel')
    }
  }

  registerToggleAll(toggleAllEl, category) {
    toggleAllEl.addEventListener('click', e => {
      e.preventDefault()
      if (toggleAllEl.getAttribute('data-open') === 'false'){
        forEach(this.titles, el => { this.open(el) })
        toggleAllEl.setAttribute('data-open', true)
      } else {
        forEach(this.titles, el => { this.close(el) })
        toggleAllEl.setAttribute('data-open', false)
      }
      if (this.multi) {
        this.updateOpenCloseTriggerDisplay(category)
      }
    })
  }

  registerClose(element, category) {
    element.addEventListener('click', e => {
      this.close(this.titles[0])
      this.publishEvent('Close', element.getAttribute('data-js-collapsible-event-label'), category)
    })
  }

  updateOpenCloseTriggerDisplay(category) {
    if (this.openItems / this.titles.length < 1) {
      forEach(this.toggleAllTrigger, trigger => this.hide(trigger, category))
    } else {
      forEach(this.toggleAllTrigger, trigger => this.show(trigger, category))
    }
  }
  
  toggle(element, category) {
    let action = ''
    if (element.getAttribute(attrExpanded) === 'true') {
      this.close(element)
      action = 'Close'
    } else {
      this.open(element)
      action = 'Open'
    }
    
    this.updateOpenCloseTriggerDisplay()
    
    this.publishEvent(action, element.getAttribute('data-js-collapsible-event-label'), category)
  }

  open(titleEl) {
    if (titleEl.getAttribute(attrExpanded) === 'true') return
    
    if (this.multi) {
      const toggleBtn = titleEl.getElementsByClassName(classToggle)[0]
      const closeLabel = toggleBtn.getAttribute('data-close-label')
      toggleBtn.innerHTML = closeLabel
    }

    const bodyEl = titleEl.nextElementSibling
    titleEl.classList.add(classExpanded)
    titleEl.setAttribute(attrExpanded, true)
    titleEl.setAttribute(attrSelected, true)

    bodyEl.classList.add(classExpanded)
    bodyEl.setAttribute(attrHidden, false)
    
    this.openItems += 1
  }

  close(titleEl) {
    if (titleEl.getAttribute(attrExpanded) === 'false') return

    if (this.multi) {
      const toggleBtn = titleEl.getElementsByClassName(classToggle)[0]
      const openLabel = toggleBtn.getAttribute('data-open-label')
      toggleBtn.innerHTML = openLabel
    }

    const bodyEl = titleEl.nextElementSibling

    titleEl.classList.remove(classExpanded)
    titleEl.setAttribute(attrExpanded, false)
    titleEl.setAttribute(attrSelected, false)

    bodyEl.classList.remove(classExpanded)
    bodyEl.setAttribute(attrHidden, true)

    this.openItems -= 1
  }

  hide(element, category) {
    const openAllLabel = element.getAttribute('data-open-all-label')
    element.innerHTML = openAllLabel
    element.setAttribute('data-open', false)
    element.setAttribute('data-js-collapsible-event-label', 'Close all')
    this.publishEvent('Toggle close all', element.getAttribute('data-js-collapsible-event-label'), category)
  }

  show(element, category) {
    const closeAllLabel = element.getAttribute('data-close-all-label')
    element.innerHTML = closeAllLabel
    element.setAttribute('data-open', true)
    element.setAttribute('data-js-collapsible-event-label', 'Show all')
    this.publishEvent('Toggle open all', element.getAttribute('data-js-collapsible-event-label'), category)
  }

  publishEvent(action, label, category) {
    this.trackEvent('send', {
      hitType: 'event',
      eventCategory: category,
      eventAction: action,
      eventLabel: label
    })
  }

  keyboardInteraction(elem, e) {
    const keyCode = e.which
    switch (keyCode) {
      // Enter/Space
      case 13:
      case 32:
        e.preventDefault()
        e.stopPropagation()

        // Show answer content
        this.toggle(elem)
        break
    }
  }
}

export default function collapsible(eventTracker = trackEvent) {
  const elCollapsible = document.getElementsByClassName(classCollapsible)

  forEach(elCollapsible, element => new Collapsible(eventTracker).registerDom(element))
}

domready(collapsible)
