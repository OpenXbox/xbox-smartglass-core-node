var assert = require('assert');
var Smartglass = require('../');

describe('smartglass', function(){
    describe('getConsoles()', function(){
        it('should return an ampty array on init', function(){
            assert(Smartglass.getConsoles().length == 0);
        });
        it('should return an array after discovery', function(){
            Smartglass.discovery();
            assert(Array.isArray(Smartglass.getConsoles()));
        });
    });
    describe('discovery()', function(){
        it('should return an array', function(){
            assert(Array.isArray(Smartglass.discovery()));
        });
    });
})
