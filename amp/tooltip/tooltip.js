/* ====================================
 * Amp framework v1.0.0
 * Quipu GmbH (http://www.quipugmbh.com)
 *
 * Amp tooltip mixin. 
 * Extends the control proto.
 * ==================================== */
;(function($, Amp) {
  var defaultOffset    = 0;
  var defaultTitle     = "I'm a tooltip!";
  var defaultPlacement = "right";
  
  function Tooltip(amp) {
    this.amp = amp;
    this.element = amp.element;
    this.node = amp.element[0];
  }

  Tooltip.prototype = {
    show: function() {
      var pos, actualWidth, actualHeight, placement, tip, tp;

      tip = this.tip();
      tip.css({ top: 0, left: 0, display: 'block' }).detach().insertAfter(this.element);

      pos = $.extend({}, this.element.position(), {
        width:  this.element.outerWidth(true),
        height: this.element.outerHeight(true)
      });

      actualWidth  = tip[0].offsetWidth;
      actualHeight = tip[0].offsetHeight;
      placement    = typeof this.placement === 'function' ? this.placement.call(this.amp) : this.placement;

      switch (placement) {
        case 'below':
          tp = {top: pos.top + pos.height + this.offset, left: pos.left + pos.width / 2 - actualWidth / 2};
          break;
        case 'above':
          tp = {top: pos.top - actualHeight - this.offset, left: pos.left + pos.width / 2 - actualWidth / 2};
          break;
        case 'left':
          tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth - this.offset};
          break;
        case 'right':
          tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width + this.offset};
          break;
      }
      tip.css(tp).removeClass('right left above below').addClass(placement).removeClass('hidden');
    },

    hide: function() {
      this.tip().addClass('hidden');
    },

    tip: function() {
      this.__tip   = this.__tip || $('<div class="amp-tooltip hidden"><div class="amp-tooltip-arrow"></div><div class="amp-tooltip-inner"></div></div>');
      this.__inner = this.__inner || $('.amp-tooltip-inner', this.__tip);
      this.__inner.html(this.title || "No title set");
      return this.__tip;
    }
  }
  
  Amp.controls.control.proto.showTip = function(title, placement, offset) {
    this.__tooltip || (this.__tooltip = new Tooltip(this));

    this.__tooltip.offset = offset !== undefined ? offset : defaultOffset;
    this.__tooltip.placement = placement || defaultPlacement;
    this.__tooltip.title = title || defaultTitle;

    this.__tooltip.show();
    return this;
  }
  
  Amp.controls.control.proto.hideTip = function(){
    this.__tooltip && this.__tooltip.hide();
    return this;
  }
  
  Amp.controls.control.proto.showTooltip = Amp.controls.control.proto.showTip;
  Amp.controls.control.proto.hideTooltip = Amp.controls.control.proto.hideTip;

  Amp.tooltipSettings = function(settings){
    'placement' in settings && (defaultPlacement = settings.placement);
    'offset' in settings && (defaultOffset = settings.offset);
    'title' in settings && (defaultTitle = settings.title);
  }
  
  Amp.registerMethods(['showTip', 'hideTip', 'showTooltip', 'hideTooltip']);
})(window.jQuery, window.Amp);
