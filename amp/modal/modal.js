/* ====================================
 * Amp framework v1.0.0
 * Quipu GmbH (http://www.quipugmbh.com)
 *
 * Amp Modal.
 * ==================================== */

;(function($, Amp) {
  var backdropClass = ''; 
  var backdropShown = false;
  var slice = Array.prototype.slice;
  var backdrop = $('<div class="amp-modal-backdrop"></div>');
  var curmodal = null;
  
  function Modal(element, options){
    // The base control that we'll extend
    var modal = Amp.createObject(Modal.proto, Amp.controls.control(element, options || {}, true));
    element.addClass('amp-modal');
    return modal;
  }

  Modal.proto = Amp.createObject(Amp.controls.control.proto, {
    /**
     * Captures the tabbing order to cycle through Amp elements within this modal. 
    **/
    captureTab: function(focusOnFirst){
      this.__unbinder && this.__unbinder();
      
      // All amp elements within this modal that are focusable
      var amps = $('.amp:not([tabindex=-1])', this.element);
      if(amps.length){
        focusOnFirst && setTimeout(function(){ amps.first().focus(); }, 0);
        function handler(e){
          if(e.which === Amp.keys.TAB && !e.shiftKey){
            e.preventDefault();
            amps.first().focus();
          }
        }
        amps.last().keydown(handler);
        this.__unbinder = function(){
          amps.last().unbind('keydown', handler);
          this.__unbinder = null;
        }
      }
      return this;
    },
    
    show: function() {
      if(this.trigger.apply(this, ['beforeshow'].concat(slice.call(arguments)))) {
        $(document.body).append(backdrop);
        backdropShown = true;
        this.element.addClass('shown');
        this.captureTab(true).trigger('show');
        this.position();
        curmodal = this;
      }
      return this;
    },
    
    hide: function() {
      this.__unbinder && this.__unbinder();
      if(this.trigger.apply(this, ['beforehide'].concat(slice.call(arguments)))) {
        backdrop && backdrop.detach();
        backdropShown = false;
        this.element.removeClass('shown');
        this.trigger('hide');
        curmodal = null;
      }
      return this;
    },
    
    position: function(){
      this.element.css({ 'margin-left': this.element.width() / -2 });
      return this;
    }
  });


  $(function(){
    $(document.body).keydown(function(e){
      if(e.which === Amp.keys.ESCAPE && curmodal) {
        curmodal && curmodal.hide();
        return false;
      }
    });
    backdrop.click(function(){
      curmodal && curmodal.hide();
    });
  });

  Amp.controls.modal = Modal;
  Amp.registerMethods(['captureTab']);
  
  Amp.showBackdrop = function(klass){
    if(!backdropShown) {
      backdropShown = true;
      klass && backdrop.addClass(backdropClass = klass);
      $(document.body).prepend(backdrop);
    }
  }
  Amp.hideBackdrop = function(){
    if(backdropShown) {
      backdrop.removeClass(backdropClass).detach();
      backdropClass = '';
      backdropShown = false;
    }
  }
  
})(window.jQuery, window.Amp);
