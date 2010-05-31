/**
 * You do not need to initialize an object with a special class. Using the
 * ContextToolkit on an object will transform the object into a Context.
 * 
 * The Context is seen as the only thing which each step of the execution of a
 * request has in common with the other steps. It will be erased as soon as the
 * response is send.
 * 
 * You may use the ContextToolkit to transform operations on the context or use
 * it as data dictionary. Just be careful not to use the reserved keys
 * (documented on this element) to be safe from framework incompatibilities.
 * 
 * @class The Context. Actually it's just an object with special fields,
 *            so everything can be a context!
 * 
 * @extends Object
 * 
 * @property {Object}
 *            [cookies={}] The cookies of the context.
 * @property {Object}
 *            [clean_cookies={}] The cookies, which are not yet overwritten in
 *            the context. Those will not be send when
 *            ContextToolkit#applyCookiesToHeaders is called!
 * @property {Object}
 *            [headers={}] The headers for the context.
 * @property {Number}
 *            [status=200] The status of the context (usually HTTP-Codes).
 * @property {Object}
 *            [session=] The current sessions content. Is undefined, if not
 *            available.
 * @property {String}
 *            [session_id=null] The current session_id.
 * @property {String}
 *            [encoding="utf8"] The encoding of the response (can be ascii, utf8 or binary).
 * @property {Object}
 *            [params={}] The GET+POST parameters.
 * 
 * @example
 * 
 * <pre>// Initializing a new context is very simple, just create a new object.
 * var context = {};
 * // now let's do some magic on that context!
 * ContextToolkit.setCookie(context, "key", "value");
 * // and so on ..
 * </pre>
 * 
 * @since 0.1
 * @author DracoBlue
 */
Context = function() {
    return {};
};