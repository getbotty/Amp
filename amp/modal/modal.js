/* ====================================
 * Amp framework v1.0.0
 * Quipu GmbH (http://www.quipugmbh.com)
 *
 * Amp Modal.
 * ==================================== */

;(function($, Amp) {
  var slice = Array.prototype.slice;
  var backdrop = null;
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
        $('body').append(backdrop || (backdrop = $('<div class="modal-backdrop"></div>')));
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
    $(document.body)
    .keydown(function(e){
      if(e.which === Amp.keys.ESCAPE && curmodal) {
        curmodal && curmodal.hide();
        return false;
      }
    })
    .delegate('.modal-backdrop', 'click', function(){
      curmodal && curmodal.hide();
    });
  });

  Amp.controls.modal = Modal;
  Amp.registerMethods(['captureTab']);
})(window.jQuery, window.Amp);
