import 'babel-polyfill';

/*
 * classList.js: Cross-browser full element.classList implementation.
 * 1.1.20150312
 *
 * By Eli Grey, http://eligrey.com
 * License: Dedicated to the public domain.
 *   See https://github.com/eligrey/classList.js/blob/master/LICENSE.md
 */

/* global self, document, DOMException */

/*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js */

if ('document' in self) {
  // Full polyfill for browsers with no classList support
  // Including IE < Edge missing SVGElement.classList
  if (
    !('classList' in document.createElement('_')) ||
    (document.createElementNS &&
      !(
        'classList' in
        document.createElementNS('http://www.w3.org/2000/svg', 'g')
      ))
  ) {
    (function(view) {
      if (!('Element' in view)) return;

      let classListProp = 'classList',
        protoProp = 'prototype',
        elemCtrProto = view.Element[protoProp],
        objCtr = Object,
        strTrim =
          String[protoProp].trim ||
          function() {
            return this.replace(/^\s+|\s+$/g, '');
          },
        arrIndexOf =
          Array[protoProp].indexOf ||
          function(item) {
            let i = 0,
              len = this.length;
            for (; i < len; i++) {
              if (i in this && this[i] === item) {
                return i;
              }
            }
            return -1;
          },
        // Vendors: please allow content code to instantiate DOMExceptions
        DOMEx = function(type, message) {
          this.name = type;
          this.code = DOMException[type];
          this.message = message;
        },
        checkTokenAndGetIndex = function(classList, token) {
          if (token === '') {
            throw new DOMEx(
              'SYNTAX_ERR',
              'An invalid or illegal string was specified'
            );
          }
          if (/\s/.test(token)) {
            throw new DOMEx(
              'INVALID_CHARACTER_ERR',
              'String contains an invalid character'
            );
          }
          return arrIndexOf.call(classList, token);
        },
        ClassList = function(elem) {
          let trimmedClasses = strTrim.call(elem.getAttribute('class') || ''),
            classes = trimmedClasses ? trimmedClasses.split(/\s+/) : [],
            i = 0,
            len = classes.length;
          for (; i < len; i++) {
            this.push(classes[i]);
          }
          this._updateClassName = function() {
            elem.setAttribute('class', this.toString());
          };
        },
        classListProto = (ClassList[protoProp] = []),
        classListGetter = function() {
          return new ClassList(this);
        };
      // Most DOMException implementations don't allow calling DOMException's toString()
      // on non-DOMExceptions. Error's toString() is sufficient here.
      DOMEx[protoProp] = Error[protoProp];
      classListProto.item = function(i) {
        return this[i] || null;
      };
      classListProto.contains = function(token) {
        token += '';
        return checkTokenAndGetIndex(this, token) !== -1;
      };
      classListProto.add = function() {
        let tokens = arguments,
          i = 0,
          l = tokens.length,
          token,
          updated = false;
        do {
          token = tokens[i] + '';
          if (checkTokenAndGetIndex(this, token) === -1) {
            this.push(token);
            updated = true;
          }
        } while (++i < l);

        if (updated) {
          this._updateClassName();
        }
      };
      classListProto.remove = function() {
        let tokens = arguments,
          i = 0,
          l = tokens.length,
          token,
          updated = false,
          index;
        do {
          token = tokens[i] + '';
          index = checkTokenAndGetIndex(this, token);
          while (index !== -1) {
            this.splice(index, 1);
            updated = true;
            index = checkTokenAndGetIndex(this, token);
          }
        } while (++i < l);

        if (updated) {
          this._updateClassName();
        }
      };
      classListProto.toggle = function(token, force) {
        token += '';

        let result = this.contains(token),
          method = result
            ? force !== true && 'remove'
            : force !== false && 'add';

        if (method) {
          this[method](token);
        }

        if (force === true || force === false) {
          return force;
        } else {
          return !result;
        }
      };
      classListProto.toString = function() {
        return this.join(' ');
      };

      if (objCtr.defineProperty) {
        let classListPropDesc = {
          get: classListGetter,
          enumerable: true,
          configurable: true
        };
        try {
          objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
        } catch (ex) {
          // IE 8 doesn't support enumerable:true
          if (ex.number === -0x7ff5ec54) {
            classListPropDesc.enumerable = false;
            objCtr.defineProperty(
              elemCtrProto,
              classListProp,
              classListPropDesc
            );
          }
        }
      } else if (objCtr[protoProp].__defineGetter__) {
        elemCtrProto.__defineGetter__(classListProp, classListGetter);
      }
    })(self);
  } else {
    // There is full or partial native classList support, so just check if we need
    // to normalize the add/remove and toggle APIs.

    (function() {
      let testElement = document.createElement('_');

      testElement.classList.add('c1', 'c2');

      // Polyfill for IE 10/11 and Firefox <26, where classList.add and
      // classList.remove exist but support only one argument at a time.
      if (!testElement.classList.contains('c2')) {
        let createMethod = function(method) {
          let original = DOMTokenList.prototype[method];

          DOMTokenList.prototype[method] = function(token) {
            let i,
              len = arguments.length;

            for (i = 0; i < len; i++) {
              token = arguments[i];
              original.call(this, token);
            }
          };
        };
        createMethod('add');
        createMethod('remove');
      }

      testElement.classList.toggle('c3', false);

      // Polyfill for IE 10 and Firefox <24, where classList.toggle does not
      // support the second argument.
      if (testElement.classList.contains('c3')) {
        let _toggle = DOMTokenList.prototype.toggle;

        DOMTokenList.prototype.toggle = function(token, force) {
          if (1 in arguments && !this.contains(token) === !force) {
            return force;
          } else {
            return _toggle.call(this, token);
          }
        };
      }

      testElement = null;
    })();
  }
}

// From https://developer.mozilla.org/en-US/docs/Web/API/Element/
if (window.Element && !Element.prototype.closest) {
  Element.prototype.closest = function(s) {
    let matches = (this.document || this.ownerDocument).querySelectorAll(s),
      i,
      el = this;
    do {
      i = matches.length;
      while (--i >= 0 && matches.item(i) !== el) {}
    } while (i < 0 && (el = el.parentElement));
    return el;
  };
}

// from:https://github.com/jserz/js_piece/blob/master/DOM/ChildNode/remove()/remove().md
(function (arr) {
  arr.forEach(function (item) {
    if (item.hasOwnProperty('remove')) {
      return;
    }
    Object.defineProperty(item, 'remove', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: function remove() {
        if (this.parentNode !== null)
          this.parentNode.removeChild(this);
      }
    });
  });
})([Element.prototype, CharacterData.prototype, DocumentType.prototype]);

// Source: https://github.com/jserz/js_piece/blob/master/DOM/ParentNode/append()/append().md
(function (arr) {
  arr.forEach(function (item) {
    if (item.hasOwnProperty('append')) {
      return;
    }
    Object.defineProperty(item, 'append', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: function append() {
        var argArr = Array.prototype.slice.call(arguments),
          docFrag = document.createDocumentFragment();

        argArr.forEach(function (argItem) {
          var isNode = argItem instanceof Node;
          docFrag.appendChild(isNode ? argItem : document.createTextNode(String(argItem)));
        });

        this.appendChild(docFrag);
      }
    });
  });
})([Element.prototype, Document.prototype, DocumentFragment.prototype]);

import 'core-js/fn/array/find';
import 'core-js/fn/array/from';
