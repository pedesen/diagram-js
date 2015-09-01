'use strict';

var inherits = require('inherits');

var Snap = require('../../vendor/snapsvg');

var BaseRenderer = require('./BaseRenderer');


function toSVGPoints(points) {
  var result = '';

  for (var i = 0, p; !!(p = points[i]); i++) {
    result += p.x + ',' + p.y + ' ';
  }

  return result;
}


/**
 * The default renderer used for shapes and connections.
 *
 * @param {Styles} styles
 */
function DefaultRenderer(eventBus, styles) {
  BaseRenderer.call(this, eventBus);

  this.CONNECTION_STYLE = styles.style([ 'no-fill' ], { strokeWidth: 5, stroke: 'fuchsia' });
  this.SHAPE_STYLE = styles.style({ fill: 'white', stroke: 'fuchsia', strokeWidth: 2 });


  this.createLine = function(points, attrs) {
    return Snap.create('polyline', { points: toSVGPoints(points) }).attr(attrs || {});
  };

  this.updateLine = function(gfx, points) {
    return gfx.attr({ points: toSVGPoints(points) });
  };
}

inherits(DefaultRenderer, BaseRenderer);


DefaultRenderer.prototype.canRender = function() {
  return true;
};

DefaultRenderer.prototype.drawShape = function drawShape(visuals, element) {
  return visuals.rect(0, 0, element.width || 0, element.height || 0).attr(this.SHAPE_STYLE);
};

DefaultRenderer.prototype.drawConnection = function drawConnection(visuals, connection) {
  return this.createLine(connection.waypoints, this.CONNECTION_STYLE).appendTo(visuals);
};

/**
 * Gets the default SVG path of a shape that represents it's visual bounds.
 *
 * @param {djs.model.Shape} shape
 * @return {string} svg path
 */
DefaultRenderer.prototype.getShapePath = function getShapePath(shape) {

  var x = shape.x,
      y = shape.y,
      width = shape.width,
      height = shape.height;

  var shapePath = [
    ['M', x, y],
    ['l', width, 0],
    ['l', 0, height],
    ['l', -width, 0],
    ['z']
  ];

  return this._componentsToPath(shapePath);
};

/**
 * Gets the default SVG path of a connection that represents it's visual bounds.
 *
 * @param {djs.model.Connection} connection
 * @return {string} svg path
 */
DefaultRenderer.prototype.getConnectionPath = function getConnectionPath(connection) {
  var waypoints = connection.waypoints;

  var idx, point, connectionPath = [];

  for (idx = 0; !!(point = waypoints[idx]); idx++) {

    // take invisible docking into account
    // when creating the path
    point = point.original || point;

    connectionPath.push([ idx === 0 ? 'M' : 'L', point.x, point.y ]);
  }

  return this._componentsToPath(connectionPath);
};

DefaultRenderer.prototype._componentsToPath = function(components) {
  return components.join(',').replace(/,?([A-z]),?/g, '$1');
};

DefaultRenderer.$inject = [ 'eventBus', 'styles' ];

module.exports = DefaultRenderer;
