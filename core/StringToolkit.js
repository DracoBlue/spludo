/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009-2010 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

/**
 * @private
 */
var xml_special_to_escaped_one_map = {
    '&': '&amp;',
    '"': '&quot;',
    '<': '&lt;',
    '>': '&gt;'
};

/**
 * @private
 */
var escaped_one_to_xml_special_map = {
    '&amp;': '&',
    '&quot;': '"',
    '&lt;': '<',
    '&gt;': '>'
};

/**
 * @class A toolkit for convenient functions to de-/encode uri, html and so on.
 * 
 * @since 0.1
 * @author DracoBlue
 */
StringToolkit = {
        
    /**
     * Escapes the 4 special entities for xml with the proper xml entities.
     * 
     * @param {String} string the input string
     * @returns {String} The escaped xml string
     */
    encodeXml: function(string) {
        return string.replace(/([\&"<>])/g, function(str, item) {
            return xml_special_to_escaped_one_map[item];
        });
    },

    /**
     * Unescapes the 4 special entities for xml.
     * 
     * @param {String} string the encoded input string
     * @returns {String} The decoded xml string
     */
    decodeXml: function(string) {
        return string.replace(/(&quot;|&lt;|&gt;|&amp;)/g, function(str, item) {
            return escaped_one_to_xml_special_map[item];
        });
    }

};
