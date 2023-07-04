const CAUSE_INSERT_VARIANT_ID = 39483287699500,
    MASK_PACK_BLACK_VARIANT_ID = 34754912845868,
    MASK_CHILD_BLACK_VARIANT_ID = 34503167705132,
    MASK_PACK_GREEN_VARIANT_ID = 34768104194092,
    MASK_CHILD_GREEN_VARIANT_ID = 34768154099756;
var PACK_CHILD_IDS = [
    { pack: MASK_PACK_BLACK_VARIANT_ID, child: MASK_CHILD_BLACK_VARIANT_ID },
    { pack: MASK_PACK_GREEN_VARIANT_ID, child: MASK_CHILD_GREEN_VARIANT_ID },
];
const MASK_PACK_QUANTITY = 3,
    IS_IN_MASK_PACK_PROPERTY = "_in_mask_pack",
    INCLUDED_IN_PACK_PROPERTY = "included_in_pack";
function cartUpdateListener() {
    return (
        this.addEventListener("load", function () {
            let a = this._url,
                b = ["/cart/update.js", "/cart/change.js"];
            ["/cart/add.js"].includes(a), b.includes(a);
        }),
        open.apply(this, arguments)
    );
}
function snapchatAddCartTracking(cartJson) {
    var snapchatTracking = window.snaptr;
    if (void 0 !== snapchatTracking) {
        var itemData = JSON.parse(cartJson),
            variantId = itemData.variant_id;
        if (void 0 !== variantId) {
            var trackingData = { currency: "USD", price: +itemData.price / 100, item_ids: [variantId.toString()], item_category: itemData.product_type };
            snapchatTracking("init", "ef23133e-21ae-4673-9405-c011205e53de"), snapchatTracking("track", "ADD_CART", trackingData);
        }
    }
}
function causeInsertAdd(cartJson) {
    var itemData = JSON.parse(cartJson),
        causeInsertId = CAUSE_INSERT_VARIANT_ID;
    itemData && addCauseInsert(causeInsertId);
}
function addCauseInsert(prodId) {
    var properties = {};
    (properties.hidden_collateral = !0),
        (properties["Shipping Option"] = "pickup Ecommerce WH"),
        jQuery.ajax({
            type: "GET",
            url: "/cart.js",
            async: !1,
            dataType: "json",
            success: function (a) {
                var b = !1;
                a.items.map(function (a) {
                    "INSERT" === a.sku && (b = !0);
                }),
                    b || jQuery.ajax({ type: "POST", url: "/cart/add.js", async: !1, data: { quantity: 1, id: prodId, properties: properties }, dataType: "json", success: function () {} });
            },
        });
}
function causeInsertUpdate(cartJson) {
    var cartData = JSON.parse(cartJson);
    if (cartData && cartData.items) {
        var cartItems = cartData.items,
            itemsLength = cartItems.length;
        for (i = 0; i < cartItems.length; i++) {
            var cartItemData = cartItems[i];
            causeInsertQtyUpdate(cartItems, itemsLength, cartItemData);
        }
    }
}
function causeInsertQtyUpdate(cartItems, itemsLength, maskPackId) {
    for (var causeInsertChildLineItemId, causeInsertChildLineItemQty = 0, i = 0; i < itemsLength; i++) {
        var cartItem = cartItems[i],
            variantId = cartItem.variant_id,
            quantity = cartItem.quantity;
        if (variantId === CAUSE_INSERT_VARIANT_ID) {
            var properties = cartItem.properties;
            properties && void 0 !== properties && void 0 !== properties.hidden_collateral && ((causeInsertChildLineItemId = cartItem.id), (causeInsertChildLineItemQty = quantity));
        }
    }
    1 === itemsLength && 1 === causeInsertChildLineItemQty && updateCauseInsertItems(causeInsertChildLineItemId, 0);
}
function updateCauseInsertItems(lineItemId, quantity) {
    if (!lineItemId || !(lineItemId > 0)) return;
    let data = { id: lineItemId, quantity: quantity };
    jQuery.ajax({ type: "POST", url: "/cart/change.js", async: !1, data: data, dataType: "json", success: function () {} });
}
function updatePackChilds(lineItemId, quantity) {
    if (!lineItemId || !(lineItemId > 0)) return;
    var properties = {};
    (properties[IS_IN_MASK_PACK_PROPERTY] = !0), (properties[INCLUDED_IN_PACK_PROPERTY] = !0);
    let data = { id: lineItemId, quantity: quantity, properties: properties };
    jQuery.ajax({ type: "POST", url: "/cart/change.js", async: !1, data: data, dataType: "json", success: function () {} });
}
function getPackIds() {
    var packIds = [],
        packsData = PACK_CHILD_IDS;
    for (i = 0; i < packsData.length; i++) {
        var packId = packsData[i].pack;
        packId && packIds.push(packId);
    }
    return packIds;
}
function getChildId(packId) {
    var packsData = PACK_CHILD_IDS;
    for (i = 0; i < packsData.length; i++) {
        var packData = packsData[i];
        if (packData.pack === packId) return packData.child;
    }
}
function addChildMask(childMaskId) {
    var properties = {};
    (properties[IS_IN_MASK_PACK_PROPERTY] = !0),
        (properties[INCLUDED_IN_PACK_PROPERTY] = !0),
        jQuery.ajax({ type: "POST", url: "/cart/add.js", async: !1, data: { quantity: MASK_PACK_QUANTITY, id: childMaskId, properties: properties }, dataType: "json", success: function () {} });
}
function maskPacksUpdate(cartJson) {
    var cartData = JSON.parse(cartJson);
    if (cartData && cartData.items) {
        var cartItems = cartData.items,
            itemsLength = cartItems.length,
            packsData = PACK_CHILD_IDS;
        for (i = 0; i < packsData.length; i++) {
            var packData = packsData[i],
                maskPackId = packData.pack,
                maskChildId = packData.child;
            maskPackUpdate(cartItems, itemsLength, maskPackId, maskChildId);
        }
    }
}
function maskPackUpdate(cartItems, itemsLength, maskPackId, maskChildId) {
    for (var maskChildLineItemId, maskPacksCount = 0, maskChildsCount = 0, i = 0; i < itemsLength; i++) {
        var cartItem = cartItems[i],
            variantId = cartItem.variant_id,
            quantity = cartItem.quantity;
        if ((variantId === maskPackId && (maskPacksCount += quantity), variantId === maskChildId)) {
            var properties = cartItem.properties;
            properties && void 0 !== properties && void 0 !== properties[IS_IN_MASK_PACK_PROPERTY] && ((maskChildLineItemId = cartItem.id), (maskChildsCount += quantity));
        }
    }
    (maskChildsShouldHaveCount = maskPacksCount * MASK_PACK_QUANTITY) > maskChildsCount
        ? addPackChilds((quantityToAdd = maskChildsShouldHaveCount - maskChildsCount), maskChildId)
        : maskChildsShouldHaveCount < maskChildsCount && updatePackChilds(maskChildLineItemId, maskChildsShouldHaveCount);
}
function addPackChilds(quantity, variantId) {
    var properties = {};
    (properties[IS_IN_MASK_PACK_PROPERTY] = !0),
        (properties[INCLUDED_IN_PACK_PROPERTY] = !0),
        jQuery.ajax({ type: "POST", url: "/cart/add.js", async: !1, data: { quantity: quantity, id: variantId, properties: properties }, dataType: "json", success: function () {} });
}
function updatePackChilds(lineItemId, quantity) {
    if (!lineItemId || !(lineItemId > 0)) return;
    var properties = {};
    (properties[IS_IN_MASK_PACK_PROPERTY] = !0), (properties[INCLUDED_IN_PACK_PROPERTY] = !0);
    let data = { id: lineItemId, quantity: quantity, properties: properties };
    jQuery.ajax({ type: "POST", url: "/cart/change.js", async: !1, data: data, dataType: "json", success: function () {} });
}
const open = window.XMLHttpRequest.prototype.open;
function attributeToString(attribute) {
    return "string" != typeof attribute && "undefined" == (attribute += "") && (attribute = ""), jQuery.trim(attribute);
}
let generateUniqueId23 = (function() {
    // fc 061623
    let usedIds = new Set();

    return function() {
        let id;
        do {
            let randomNum = Math.floor(Math.random() * 100);
            id = 'bndl' + String(randomNum).padStart(3, '0');
        } while(usedIds.has(id) && usedIds.size < 100)

        if (usedIds.size >= 100) {
            throw new Error("All possible IDs have been generated");
        }

        usedIds.add(id);

        return id;
    };
})();
(window.XMLHttpRequest.prototype.open = cartUpdateListener),
    "undefined" == typeof ShopifyAPI && (ShopifyAPI = {}),
    (ShopifyAPI.onCartUpdate = function (a) {}),
    (ShopifyAPI.updateCartNote = function (a, c) {
        var b = {
            type: "POST",
            url: "/cart/update.js",
            data: "note=" + attributeToString(a),
            dataType: "json",
            success: function (a) {
                "function" == typeof c ? c(a) : ShopifyAPI.onCartUpdate(a);
            },
            error: function (a, b) {
                ShopifyAPI.onError(a, b);
            },
        };
        jQuery.ajax(b);
    }),
    (ShopifyAPI.onError = function (XMLHttpRequest, textStatus) {
        var data = eval("(" + XMLHttpRequest.responseText + ")");
        data.message && alert(data.message + "(" + data.status + "): " + data.description);
    }),
    (ShopifyAPI.addItem = function (id, qty, properties) {
        var params = {
            type: "POST",
            url: "/cart/add.js",
            async: !1,
            data: { quantity: qty, id: id, properties: properties },
            dataType: "json",
            beforeSend: function () {},
            success: function (a) {
                console.log(":: core ADDtoCART event ::", a),
                    (window.liQ = window.liQ || []),
                    window.liQ.push({ event: "addToCart", email: window.customer_email, items: [{ id: a.id.toString(), price: Shopify.formatMoney(a.price, window.money).replace("$", ""), quantity: a.qty, currency: "USD" }] }),
                    (window.dotq = window.dotq || []),
                    window.dotq.push({ projectId: "10000", properties: { pixelId: "10172108", qstrings: { et: "custom", ec: "shopping", ea: "yn-add_to_cart", el: "add to cart", ev: a.sku + "::" + a.qty, gv: "" } } });

                
            },
            error: function (XMLHttpRequest, textStatus) {
                $("body").removeClass("velaCartAdding");
                var data = eval("(" + XMLHttpRequest.responseText + ")");
                data.message && 422 == data.status && $("#summary-error").append('<div class="alert alert-danger qtyError">' + data.description + "</div>");
            },
        };
        jQuery.ajax(params);
    }),
    (ShopifyAPI.addItemFromForm = async function (a, d, e) {
        // fc 041123
        let getBndlQuickId = ''
        const checkBndl = Object.values(a.attributes).length > 4;
        if(checkBndl){
              getBndlQuickId = a.getAttribute('id');
        }
      
        let bndlId = document.getElementById('eby-bundle-bras23');
        const bndlConditional = window.location.pathname.includes('collections/');
        let isSheerTierOne = '';
        let isSheerTierTwo = '';
      
        let bundleId23 = 0;

        // jQuery('.ebyProdTile[data-prodsku="7117808173100"]').attr('data-prodtype')
        let isABundleProd = jQuery(event.target).closest('.ebyProdTile').attr('data-prodtype') == "pack";
        const isQuickAddBrn = event.target.classList;
      
        if (!isABundleProd && !isQuickAddBrn.value.includes("filterModeAddToCart") ) {
          let ogPrdTile = jQuery('.ebyProdTile[data-prodsku="'+ event.target.getAttribute('id').replace('product-actions-', '') +'"]').attr('data-prodtype');
          isABundleProd = ogPrdTile == "pack";
        }
      
        if(getBndlQuickId.includes('product-actions') && bndlConditional && isABundleProd){
            bndlId = document.getElementById(`eby-bundle-bras23-${getBndlQuickId.split('-')[2]}`);
            bundleId23 = bndlId.dataset.bundlepdp;  
        } else if(bndlId instanceof HTMLElement){
            bundleId23 = bndlId.dataset.bundlepdp; 
        }
        if ($(a).find(".btnAddToCart").hasClass("AddBundleProduct")) {
            console.log('adding a pack bundle', {
              parent: a,
              children: $(".bundle-products .single-product")
            });
            // if this is a mystery pack
            if (jQuery('#mystery-pack-ids').length > 0) {
              let variantIdsToAdd = "";
              let mysteryPackData = {};
              
              if (window.packIdsToAddIfAvail.length < 3) {
                if (window.packIdsToAddIfAvail.length == 2) {
                  variantIdsToAdd = window.packIdsToAddIfAvail[0] + "," + window.packIdsToAddIfAvail[1] + "," + window.packIdsToAddIfAvail[0];
                  mysteryPackData = {
                    items: [
                      {quantity: 2, id: window.packIdsToAddIfAvail[0], properties: {sub_bundle: "0", included_in_pack: !0, "Shipping Option": "Ecommerce WH"}},
                      {quantity: 1, id: window.packIdsToAddIfAvail[1], properties: {sub_bundle: "0", included_in_pack: !0, "Shipping Option": "Ecommerce WH"}}
                    ]
                  };
                }
                if (window.packIdsToAddIfAvail.length == 1) {
                  variantIdsToAdd = window.packIdsToAddIfAvail[0] + "," + window.packIdsToAddIfAvail[0] + "," + window.packIdsToAddIfAvail[0];
                  mysteryPackData = {
                    items: [
                      {quantity: 3, id: window.packIdsToAddIfAvail[0], properties: {sub_bundle: "0", included_in_pack: !0, "Shipping Option": "Ecommerce WH"}}
                    ]
                  };
                }
              } else {
                variantIdsToAdd = window.packIdsToAddIfAvail[0] + "," + window.packIdsToAddIfAvail[1] + "," + window.packIdsToAddIfAvail[2];
                mysteryPackData = {
                  items: [
                    {quantity: 1, id: window.packIdsToAddIfAvail[0], properties: {sub_bundle: "0", included_in_pack: !0, "Shipping Option": "Ecommerce WH"}},
                    {quantity: 1, id: window.packIdsToAddIfAvail[1], properties: {sub_bundle: "0", included_in_pack: !0, "Shipping Option": "Ecommerce WH"}},
                    {quantity: 1, id: window.packIdsToAddIfAvail[2], properties: {sub_bundle: "0", included_in_pack: !0, "Shipping Option": "Ecommerce WH"}}
                  ]
                };
              }
              $("#v_ids").val(variantIdsToAdd);
              jQuery.ajax({
                  type: 'POST',
                  url: '/cart/add.js',
                  async: false,
                  data: mysteryPackData,
                  dataType: 'json',
                  success: function (a) {},
              });
            } else {
              var b = [];
              $(".bundle-products .single-product").each(function (d, c) {
                  var a = "";
                  (a = $(c).find(".product-selector option:selected").val()), b.push(a);
              }),
              $("#v_ids").val(b.join(",")),
              $(b).each(function (b, a) {
                  jQuery.ajax({
                      type: "POST",
                      url: "/cart/add.js",
                      async: !1,
                      data: { quantity: 1, id: a, properties: { sub_bundle: "0", included_in_pack: !0, "Shipping Option": "Ecommerce WH" } },
                      dataType: "json",
                      success: function (a) {},
                  });
              });
            } 
        }
        /*
            ********************************************************
            * Bundle brapacks start  fc 041123
            * products/black-support-bralette-2-pack 
            * Price is with shopify functions 
            ********************************************************
        */
        else if(typeof bundleId23 === 'string'){

            const isSetPdp = document.querySelector('#setVariant23-0');
            // check if bundle has different colors
            const mixStr = bndlId.dataset.bundlepdp2;
            const mixStrSheer = bndlId.dataset.mainvr;
            // tiers in sheer bra 
            isSheerTierOne = bndlId.dataset.sheerone === "true";  
            isSheerTierTwo = bndlId.dataset.sheertwo === "true";  
            // reformat of price for bundles/packs/sets
            const packPriceArr = bndlId.dataset.packprice;
            let $productSelect = '';
            // give it a unique id 
            const uniqueIdBndlSet = generateUniqueId23();
            // check if we are on the product page
            if (window.location.pathname.includes('/products/')) {
                $productSelect = a[2];
            } else if (window.location.pathname.includes('/collections/')) {
                $productSelect = a[0];
            }
            let isMixedBlnk = 'bra_bundle_pack';
            if( mixStrSheer.indexOf('::') !== -1 ){
                isMixedBlnk = mixStrSheer.split('::').indexOf('6664648458284') == -1 ? 'bra_bundle_pack' : 'bra_bundle_pack_sheer';
            }
            // needs refactor
            if(isSheerTierOne){
                isMixedBlnk = "bra_bundle_pack_sheer";
            } else if(isSheerTierTwo){
                isMixedBlnk = "bra_bundle_pack_sheer_two";
            }
            
            // if it does add 1 of each
            if(isSetPdp){
                // 060623
                const priceProperty = allCombinationsCode(packPriceArr);
                const itemSend1 = await mainBundleBralette(bundleId23, 1, priceProperty[0], mixStrSheer);
                const itemSend2 = await mainBundleBralette(mixStr, 1, priceProperty[1], mixStrSheer);
                mainBundleSet(itemSend1, itemSend2);
            } else if (mixStr.length > 10) {
                const itemSend1 = await mainBundleBralette(bundleId23, 1, 'bra_bundle_pack_sheer', mixStrSheer);
                const itemSend2 = await mainBundleBralette(mixStr, 1, isMixedBlnk, mixStrSheer);
                mainBundleSet(itemSend1, itemSend2);
            } else { 
                const itemSend1 = await mainBundleBralette(bundleId23, 2, isMixedBlnk, mixStrSheer);
                mainBundleSet(itemSend1);
            }
            function mainBundleSet(item1, item2){
                const constructItems = itemPayload(item1, item2);
                sendBundleSet(constructItems);
            }
            // Main method for POST request
            async function sendBundleSet(itemArr){
                const bundleItems = { "items": itemArr }
             
                try {
                    const response = await fetch('/cart/add.js', {
                      method: 'POST',
                      body: JSON.stringify(bundleItems),
                      headers: {
                        'Content-Type': 'application/json'
                      },
                      beforeSend: function () {
                        $("body").addClass("velaCartAdding");
                      }
                    });
                    const postData = await response.json();

                    postData.items.forEach(d => {
                        console.log('Send first pack', d);
                        modalToast(d);
                    })
                    //updateTrueCartCount();
                  } catch (error) {
                    console.error(`Error while adding ${error.responseJSON.description}`, `\n Status: ${error.status}`);
                    console.error('error c', error);
                }
            }
            function itemPayload(...items){
                const validItems = items.filter(Boolean);
                const allVariants = validItems.map(item => item.id).join('::');
                const sendPayload = validItems.map((item) => {
                    return {
                        quantity: item.quantity, 
                        id: item.id, 
                        properties: { 
                            [item.type]: !0, 
                            "isBundleSet": allVariants, 
                            "typeBndlSet": item.type,  
                            "Shipping Option": "Ecommerce WH" 
                        }
                    };
                });
                return sendPayload
            }
            function mainBundleBralette(bundleIds, n, mixType, _ids){
                // convert variant and ids to keys and val
                const variantSend = bndlSizeObj(bundleIds);
                // variant selected by user
                const bndlSelectedSize = selectedProductSet($productSelect, mixType);
                // find the key and send the new variant id
                const idSend = findIdMap(bndlSelectedSize, variantSend);
                // fc 061623 // uniqueIdBndlSet
                const item = {
                    quantity: n, 
                    variantId : _ids,
                    id: idSend, 
                    type: mixType
                };

                return item

                function bndlSizeObj(data){
                  let newVariants = new Map();
                  const tempData = data.split(':');
    
                  for(const el of tempData){
                    const [size, varId] = el.split('_');
                    newVariants.set(size, varId);
                  }
                  return newVariants
                }
                function findIdMap(str, obj){
                  const newStr = str.split('-')[0].trim();
                  return obj.get(newStr);
                }
            }
            function selectedProductSet(el, type){
                
                let variantSelected = '';
                const selectedBra = document.getElementById('setVariant23-0');
                const selectedPant = document.getElementById('setVariant23-1');

                if( (selectedBra != null) && (type.includes('bra')) ){
                    variantSelected = selectedBra.value.toLowerCase();
                } else if( (selectedBra != null) && (type.includes('pan')) ){
                    variantSelected = selectedPant.value.toLowerCase(); 
                } else {
                    variantSelected =  el.selectedOptions[0].innerText;
                } 

                return variantSelected
            }
            function allCombinationsCode(arr){
                // get both codes and return price
                if(!arr.includes('::')){
                    console.warn('Bundle code needs to be updated for packPriceArr, ie. packPriceArr-bra003::pan002');
                    return;
                }
                return arr.split('::');
            }
        } else {
        var f = !1,
            c = {
                type: "POST",
                url: "/cart/add.js",
                data: jQuery(a).serialize(),
                dataType: "json",
                beforeSend: function () {
                    $("body").addClass("velaCartAdding");
                },
                success: function (b) {
                    if (
                        ($("body").removeClass("velaCartAdding"),
                        "modal" == window.ajaxcart_type &&
                            (null != b.image ? $(".headerCartModal").find(".cartProductImage img").attr("src", b.image) : $(".headerCartModal").find(".cartProductImage img").attr("src", "//placehold.it/100x100"),
                            $(".headerCartModal").find(".productTitle").html(b.title),
                            $(".headerCartModal").addClass("active")),
                        "function" == typeof d ? d(b, a) : ShopifyAPI.onItemAdded(b, a),
                        console.log(":: core ADDtoCART event 1 ::", b),
                        b.product_type.indexOf("Mesh") >= 0)
                    )
                        var c = b.product_title.replace("Highwaisted", "HC High Waisted");
                    else var c = b.product_title;
                    M.toast({
                        html:
                            '<span class="atcNoteAvatar"><header><p class="bold">ADDED TO CART</p><p>' +
                            c +
                            '</p></header><img class="prodImg-atc" data-prod-added="' +
                            b.id +
                            '" width="50" height="50" src="' +
                            b.featured_image.url +
                            '" /></span>',
                        classes: "ebyAtcAlert success",
                    }),
                        (window.liQ = window.liQ || []),
                        window.liQ.push({ event: "addToCart", email: window.customer_email, items: [{ id: b.id.toString(), price: Shopify.formatMoney(b.price, window.money).replace("$", ""), quantity: b.qty, currency: "USD" }] }),
                        (window.dotq = window.dotq || []),
                        window.dotq.push({ projectId: "10000", properties: { pixelId: "10172108", qstrings: { et: "custom", ec: "shopping", ea: "yn-add_to_cart", el: "add to cart", ev: b.sku + "::" + b.qty, gv: "" } } }),
                        f ||
                            ((f = !0),
                            gtag("event", "add_to_cart", {
                                currency: "USD",
                                value: parseInt(Shopify.formatMoney(b.price).replace("$", "")),
                                page_location: window.location.pathname, 
                                page_title: document.title,
                                event_category: b.product_title,
                                event_label: window.location.pathname.indexOf("/products/") >= 0 ? 'atc_type-proddetail_def' : window.location.pathname.indexOf("/pages/") >= 0 ? 'atc_type-landingpage_def' : 'atc_type-quickadd_def',
                                items: [
                                    {
                                        item_id: b.product_id,
                                        item_name: b.product_title,
                                        affiliation: b.vendor,
                                        index: 0,
                                        item_category: b.product_type,
                                        item_variant: b.variant_title,
                                        price: parseInt(Shopify.formatMoney(b.price).replace("$", "")),
                                        currency: "USD",
                                        quantity: 1,
                                    },
                                ],
                            }),
                            geq.addToCart({
                              Name: b.product_title,
                              ProductID: b.id,
                              ImageURL: b.image,
                              URL: b.url,
                              Brand: b.vendor,
                              Price: Shopify.formatMoney(b.price).replace("$", "")
                            }),
                            ttq
                                .instance("CBK4Q5RC77U0CJTABNJG")
                                .track("AddToCart", {
                                    content_id: b.id,
                                    content_type: "product",
                                    content_category: b.product_type,
                                    content_name: b.product_title,
                                    quantity: 1,
                                    price: Shopify.formatMoney(b.price).replace("$", ""),
                                    value: $("#hcw").data("ct"),
                                    currency: "USD",
                                }));
                },
                error: function (b, c) {
                    $("body").removeClass("velaCartAdding"), "function" == typeof e ? e(a, b, c) : ShopifyAPI.onError(b, c);
                },
            };
        jQuery.ajax(c);
      }
      function modalToast(b){
            if (
                ($("body").removeClass("velaCartAdding"),
                "modal" == window.ajaxcart_type &&
                    (null != b.image ? $(".headerCartModal").find(".cartProductImage img").attr("src", b.image) : 
                    $(".headerCartModal").find(".cartProductImage img").attr("src", "//placehold.it/100x100"),
                    $(".headerCartModal").find(".productTitle").html(b.title),
                    $(".headerCartModal").addClass("active")),
                "function" == typeof d ? d(b, a) : ShopifyAPI.onItemAdded(b, a),
                console.log(":: core ADDtoCART event 1 ::", b),
                b.product_type.indexOf("Mesh") >= 0)
            )
                var c = b.product_title.replace("Highwaisted", "HC High Waisted");
            else var c = b.product_title;
            M.toast({
                html:
                    '<span class="atcNoteAvatar"><header><p class="bold">ADDED TO CART</p><p>' +
                    c +
                    '</p></header><img class="prodImg-atc" data-prod-added="' +
                    b.id +
                    '" width="50" height="50" src="' +
                    b.featured_image.url +
                    '" /></span>',
                classes: "ebyAtcAlert success",
            });
            const typeBndlSet = b.properties['typeBndlSet'] ? b.properties['typeBndlSet'] : '';
             
            gtag('event', 'add_to_cart_bundleSet', {
                item_id: b.id,
                item_name: b.product_title,
                price: b.price,
                item_variant: b.variant_title,
                item_properties: typeBndlSet
            });
        }
    }),
    (ShopifyAPI.getCart = function (a) {
        jQuery.getJSON("/cart.js", function (b, c) {
            "function" == typeof a ? a(b) : ShopifyAPI.onCartUpdate(b);
        });
    }),
    (ShopifyAPI.changeItem = function (b, c, e, a) {
        void 0 === a && (a = !1);
        var d = {
            type: "POST",
            url: "/cart/change.js",
            data: "quantity=" + c + "&line=" + b,
            dataType: "json",
            success: function (b) {
                if (!0 == a && b.total_discount > 0 && c % 3 == 0) {
                    let d = 12;
                    !0 == Shopify.customerVIP && (d = 6), (d = (c / 3) * d);
                }
                "function" == typeof a && 1 == b.item_count ? a(b) : "function" == typeof e ? e(b) : ShopifyAPI.onCartUpdate(b);
            },
            error: function (a, b) {
                ShopifyAPI.onError(a, b);
            },
        };
        jQuery.ajax(d);
    });
var ajaxCart = (function (module, $) {
    //console.log('👻 Ajax cart Loaded in file vela_ajaxcart.js 😀');
    "use strict";
    var init,
        loadCart,
        settings,
        isUpdating,
        $body,
        $formContainer,
        $addToCart,
        $cartCountSelector,
        $cartCostSelector,
        $cartContainer,
        $drawerContainer,
        updateCountPrice,
        formOverride,
        itemAddedCallback,
        itemErrorCallback,
        cartUpdateCallback,
        buildCart,
        cartCallback,
        adjustCart,
        adjustCartCallback,
        createQtySelectors,
        qtySelectors,
        validateQty,
        submitAjaxCart,
        formOverrideLite;
    let y = 0;
    return (
        (init = function (a) {
            (settings = {
                formSelector: 'form[action^="/cart/add"]',
                cartContainer: "#cartContainer",
                addToCartSelector: "#AddToCart",
                cartCountSelector: "#CartCount",
                cartCostSelector: "#CartCost",
                moneyFormat: window.money,
                disableAjaxCart: !1,
                enableQtySelectors: !0,
            }),
                $.extend(settings, a),
                ($formContainer = $(settings.formSelector)),
                ($cartContainer = $(settings.cartContainer)),
                ($addToCart = $formContainer.find(settings.addToCartSelector)),
                ($cartCountSelector = $(settings.cartCountSelector)),
                ($cartCostSelector = $(settings.cartCostSelector)),
                ($body = $("body")),
                (isUpdating = !1),
                settings.enableQtySelectors && qtySelectors(),
                !settings.disableAjaxCart && $addToCart.length && formOverride(),
                0 == y && ((y = 1), adjustCart());
        }),
        (loadCart = window.loadCart = function () {
            $body.addClass("ajaxcartIsLoading"),
                ShopifyAPI.getCart(cartUpdateCallback);
                // $.get("/cart?view=mystry", {}, function (a) {
                //     var htmlSnippet = document.createElement('template');
                //     htmlSnippet.innerHTML = a.trim();
                //     $("#mystry_product").html(htmlSnippet);
                // }, "json");
                // $.ajax({
                //     url: "/cart?view=mystry",
                //     data: '',
                //     success: function (a) {
                //         var htmlSnippet = document.createElement('template');
                //         htmlSnippet.innerHTML = JSON.parse(a.trim())[0];
                //         $("#mystry_product").html(htmlSnippet.innerHTML);
                //     },
                //     dataType: "html"
                // });
        }),
        (updateCountPrice = function (b) {
            if ($cartCountSelector) {
                for (var c = 0, d = 0; d < b.items.length; d++) {
                    var a = b.items[d];
                    !(Object.keys(a.properties).length > 0) ||
                        "Sub Subscription" === a.properties.product_type ||
                        a.properties.sub_bundle ||
                        a.properties.hidden_collateral ||
                        a.properties.included_in_custombox ||
                        a.properties.included_in_membershipbox ||
                        a.properties.included_in_pack ||
                        (c += a.quantity);
                }
                //$cartCountSelector.html(c).removeClass("hidden-count"), jQuery("#CartCountMobile").html(c).removeClass("hidden-count"), 0 === b.item_count && $cartCountSelector.addClass("hidden-count");
            }
            $cartCostSelector && $cartCostSelector.html(Shopify.formatMoney(b.total_price, settings.moneyFormat));
        }),
        (formOverride = function () {
            jQuery("body").unbind("submit"),
                jQuery("body").on("submit", 'form[action^="/cart/add"]', function (a) {
                console.clear();
                console.log(window.location.pathname);
                // fc 040523
                const isSelectedSize = selectSizeCheck();
                if( (isSelectedSize) && (window.location.pathname.indexOf('/products/') === 0)  ){
                    M.toast({html: 'Please Choose Your Size', classes: 'ebyAtcAlert didntsize error', displayLength: 1250});
                    
                    a.preventDefault();
                    a.stopImmediatePropagation();
                    a.stopPropagation();
                
                    return false;
                }
                    $formContainer.find("input[type='submit']").attr("disabled", "disabled"),
                        $formContainer.data("submitted"),
                        $addToCart.attr("disable", !0),
                        a.preventDefault(),
                        $addToCart.removeClass("is-added").addClass("is-adding"),
                        $(".qtyError").remove(),
                        ShopifyAPI.addItemFromForm(a.target, itemAddedCallback, itemErrorCallback),
                        $formContainer.hasClass("form-ajaxtocart") && ($("#velaQuickView").fadeOut(500), $(".jsQuickview").html(""), $(".jsQuickview").fadeOut(500)),
                        $addToCart.attr("disable", !1);
                });
        }),
        (formOverrideLite = function (a) {
            jQuery("body").unbind("submit"),
                //console.log(":: piecheck :: formOverrideLite", $formContainer),
                a
                    ? jQuery('form[action^="/cart/add"]').on("submit", function (a) {
                          a.preventDefault();
                      })
                    : ($formContainer.unbind("submit"),
                      $formContainer.on("submit", function (a) {
                          a.preventDefault();
                      }));
        }),
        (itemAddedCallback = function (a) {
            $addToCart.removeClass("is-adding").addClass("is-added"), console.log(":: itemAddedCallback ::", a), ShopifyAPI.getCart(cartUpdateCallback);
            let braPantyBogoElem = document.querySelector("#nudge-bogo_popup-tbop");
            // is there a bogo deal online
            if (!!braPantyBogoElem) {
                jQuery.getJSON('/cart.js', function(cart) {
                   // now have access to Shopify cart object
                  if (!!cart) {
                      console.log(':: pulled current cart object ::', {
                        cart : cart
                      });
    
                      // tbop feat
                      // check that the note on the cart object is not set yet
                      console.log(":: check for bogo deal ::", cart);
                      let numberOfBralettesInCart = cart.items.reduce((acc, lineItem) => {return lineItem.product_type.indexOf("Bralette") >= 0 ? lineItem.quantity == 1 ? acc += 1 : acc += lineItem.quantity : acc;}, 0);
                      if (numberOfBralettesInCart >= 2 && !cart.attributes.has_tbop) {
                          
                          M.Modal.init(braPantyBogoElem, {
                            preventScrolling : true,
                            dismissible : false
                          }).open();
                          // call stock check module for tbop
                          vela.initTbopProductQty('#nudge-bogo_popup-tbop');
                      } else {
                          //console.log(':: we require more minerals ::');
                      }
        
                  } else {
                      console.log('::ERROR:: cart not found');
                  }
                });
            }
        }),
        (itemErrorCallback = function (form, XMLHttpRequest, textStatus) {
            var data = eval("(" + XMLHttpRequest.responseText + ")");
            $addToCart.removeClass("is-adding is-added"), data.message && 422 == data.status && $(form).after('<div class="alert alert-danger qtyError">' + data.description + "</div>");
        }),
        (cartUpdateCallback = function (a) {
            let b = !1,
                c = !1;
            if ("function" == typeof bFreeGiftProduct) {
                var d = bFreeGiftProduct(a, !!$("body").hasClass("template-cart"), !0);
                if (!0 == d.foundMoreFreeGift && !0 == $("body").hasClass("template-cart")) return ShopifyAPI.getCart(cartUpdateCallback), !1;
                (a = d.cart), (b = !0);
            } else if ("function" == typeof bRulesDiscount) {
                var e = !1;
                if ("Subscription Box" == a.attributes["Product Type"]) var e = !0;
                var f = 0;
                $.each(a.items, function (b, a) {
                    f += a.original_price * a.quantity;
                }),
                    bRulesDiscount(f, e),
                    (c = !0);
            }

            // check if a freepanty needs to be removed
            let numberOfBralettesInCart = a.items.reduce((acc, lineItem) => {return lineItem.product_type.indexOf("Bralette") >= 0 ? lineItem.quantity == 1 ? acc += 1 : acc += lineItem.quantity : acc;}, 0);

            // check if a freepanty cart tag needs to be removed
            if (numberOfBralettesInCart < 2 && !!a.attributes.has_tbop) {
                console.log(':: remove attribute ::');
              
                jQuery.ajax({
                    type: 'POST',
                    url: '/cart/update.js',
                    async: false,
                    data: "attributes[has_tbop]=",
                    dataType: 'json',
                    success:function(data) {
                      console.log(':: free panty cart attribute removed ::',{data: data});
                    }
                });
            }
          
            // updateCountPrice(a),
            //     buildCart(a, b, c),
            //     $.ajax({
            //         url: "/cart?view=mystry",
            //         data: '',
            //         success: function (a) {
            //             var htmlSnippet = document.createElement('template');
            //             htmlSnippet.innerHTML = JSON.parse(a.trim())[0];
            //             $("#mystry_product").html(htmlSnippet.innerHTML);
            //         },
            //         dataType: "html"
            //     });
            updateCountPrice(a),
            buildCart(a, b, c);
        }),
        (buildCart = function (a, f, g) {
            void 0 === f && (f = !1), void 0 === g && (g = !1);
            let e = null,
                o = _.cloneDeep(a);

            console.log(':: init cart build ::', a.items);
            // push view ev to ga4
            gtag("event", "view_cart", {
                currency: "USD",
              	value: parseInt(Shopify.formatMoney(a.total_price).replace("$", "")),
                has_sub_in_cart: a.items.reduce((acc, lineItem) => {return lineItem.product_type.indexOf("Subscription") >= 0 ? acc = true : acc;}, false),
                sub_in_cart: a.items.reduce((acc, lineItem) => {return lineItem.product_type.indexOf("Subscription") >= 0 ? acc = lineItem.sku : acc;}, "n_a"),
                event_label: "cartview_type-sidecart_open",
                items: a.items.map((item, index) => ({
                  item_id: item.product_id,
                  affiliation: 'EBY',
                  item_name: item.product_title,
                  item_category: item.product_type,
                  index: index,
                  currency: 'USD',
                  discount: parseInt(Shopify.formatMoney(item.original_line_price - item.final_line_price).replace("$", "")),
                  price: parseInt(Shopify.formatMoney(item.final_line_price).replace("$", "")),
                  quantity: item.quantity,
                  item_variant: item.variant_title
                }))
            });
          
            if (($cartContainer.find(".gamification.wrapper").length && (e = $cartContainer.find(".gamification.wrapper").clone()), $cartContainer.empty(), "modal" == window.ajaxcart_type)) {
                if (0 === a.item_count) {
                    $cartContainer.append('<div class="headerCartEmpty">Your Cart is Empty.</div>'), cartCallback(a);
                    return;
                }
                var h = [],
                    p = {},
                    c = {},
                    i = $("#headerCartTemplate").html(),
                    j = Handlebars.compile(i);
                $.each(a.items, function (e, a) {
                    if (null != a.image) var c = a.image.replace(/(\.[^.]*)$/, "_200x$1").replace("http:", "");
                    else var c = "//cdn.shopify.com/s/assets/admin/no-image-medium-cc9732cb976dd349a0df1d39816fbcc7.gif";
                    let f = !1;
                    null !== a.properties &&
                        $.each(a.properties, function (b, c) {
                            "Free" === b && "Gift" === c && ((f = !0), delete a.properties[b]);
                        });
                    let d = a.product_title;
                    if (
                        (a.product_type.indexOf("Mesh") >= 0 && (d = a.product_title.replace("Mesh", "Sheer").replace("Highwaisted", "HC Highwaisted")),
                        (p = {
                            id: a.variant_id,
                            line: e + 1,
                            url: a.url,
                            img: c,
                            name: d,
                            variation: a.variant_title,
                            properties: a.properties,
                            itemAdd: a.quantity + 1,
                            itemMinus: a.quantity - 1,
                            itemQty: a.quantity,
                            price: Shopify.formatMoney(a.price, settings.moneyFormat),
                            vendor: a.vendor,
                            productType: a.product_type,
                            productFreeGift: f,
                        }).properties)
                    )
                        for (var b in p.properties) "_" === b[0] && delete p.properties[b];
                    if (p.variation) for (var b in p.variation) "_" === b[0] && delete p.variation[b];
                    h.push(p);
                }),
                    (c = { items: h, note: a.note, totalPrice: Shopify.formatMoney(a.total_price, settings.moneyFormat) }),
                    $cartContainer.append(j(c)),
                    submitAjaxCart(),
                    cartCallback(a);
            } else {
                // if the cart is at 0 items
                if (0 === a.item_count) {
                    $(".cartIndicator").addClass("ebyMinicartEmptyCount").removeClass("ebyMinicartHasCount"),
                        $(".velaCartTop").addClass("empty").removeClass("avail"),
                        $(".ebyMicroBtn.joinNow").removeClass("buy").addClass("join"),
                        $(".header-minicart-wrapper").removeClass("checkout").addClass("shop"),
                        $(".header-checkoutbtn-wrapper").removeClass("checkout").addClass("shop"),
                        $cartContainer.append('<div class="drawerCartEmpty"><section class="emptyCartWrapper"><p>No Items Added Yet.</p></section></div>'),
                        cartCallback(a);
                    return;
                }
                a.item_count > 0 && ($(".ebyHeaderCtaWrapper").removeClass("join").addClass("buy"), $(".ebyMicroBtn.joinNow").removeClass("join").addClass("buy"), $(".header-checkoutbtn-wrapper").removeClass("shop").addClass("checkout"));
                var h = [],
                    p = {},
                    c = {},
                    i = $("#CartTemplate").html(),
                    j = Handlebars.compile(i),
                    w = [],
                    x = [],
                    y = [],
                    z = [],
                    l = 0,
                    b = 0,
                    q = !1,
                    m = !1,
                    r = !1,
                    n = !1,
                    A = "3",
                    s = !1,
                    t = !1,
                    u = null,
                    v = null;
                void 0 != a.attributes &&
                    (a.attributes["Discount code"] && "False" != a.attributes["Discount code"] && (q = a.attributes["Discount code"]), a.attributes.has_cb_membership && "true" == a.attributes.has_cb_membership && (n = !0)),
                    $.each(a.items, function (j, c) {
                        if (null != c.image) var r = c.image.replace(/(\.[^.]*)$/, "_200x$1").replace("http:", "");
                        else var r = "//cdn.shopify.com/s/assets/admin/no-image-medium-cc9732cb976dd349a0df1d39816fbcc7.gif";
                        var u = c.original_line_price,
                            g = c.line_price;
                        !1 != q && ("5%25Bonus" == q && (b += 0.05 * g), "10%25Bonus" == q && (b += 0.1 * g));
                        let v = "",
                            B = !1;
                        !0 == n && ((v = "Custom"), void 0 != c.properties && "Main Subscription" === c.properties.product_type && ((A = c.properties.shipping_interval_frequency), (B = !0))),
                            !0 == B && (v = c.title.replace("EBY Subscription - ", "").slice(0, c.title.replace("EBY Subscription - ", "").indexOf(" ("))),
                            "3" == A ? (s = !0) : (t = !0);
                        var C = !1;
                        u > g && (C = !0);
                        let D = !1;
                        null !== c.properties &&
                            $.each(c.properties, function (a, b) {
                                "Free" === a && "Gift" === b && ((D = !0), delete c.properties[a]);
                            });
                        let K = !1,
                            k = !1,
                            L = !1,
                            M = !1,
                            N = !1,
                            O = "";
                        var isInMembershipBox = false;
                            
                        null !== c.properties &&
                            $.each(c.properties, function (a, b) {
                                "hidden_collateral" === a ? (K = !0) : "included_in_custombox" === a && "true" === b ? (k = !0) : "ltd_cb_prod" === a && "true" === b && (L = !0),
                                    "Related product" == a && ((N = !0), (O = b)),
                                    ("labor_sale_pack" == a || "build_a_pack" == a) && (("pack_3" == b && c.properties.build_id.split(",")[2] == c.id) || ("pack_6" == b && c.properties.build_id.split(",")[5] == c.id)) && (M = !0),
                                    "mystery_pack" == a && (M = !0);
                                if (a == "included_in_membershipbox"){
                                  console.log('-- works --', c);
                                   isInMembershipBox = true;
                                }
                            });
                        var E = "",
                            o = "",
                            i = "false",
                            F = "";
                        if (k) {
                            let e = "",
                                f = "";
                            c.product_title.indexOf("Higwaisted Thong") >= 0
                                ? (e = "highwaisted_thong")
                                : c.product_title.indexOf("Brief") >= 0
                                ? (e = "brief")
                                : c.product_title.indexOf("Bikini") >= 0
                                ? (e = "bikini")
                                : c.product_title.indexOf("Thong") >= 0
                                ? (e = "thong")
                                : c.product_title.indexOf("Highwaisted") >= 0
                                ? (e = "highwaisted")
                                : c.product_title.indexOf("Cheeky") >= 0 && (e = "cheeky"),
                                (f = c.product_title.replace(" Thong", "").replace(" Bikini", "").replace(" Cheeky", "").replace(" Highwaisted Thong", "").replace(" Highwaisted", "").replace(" Brief", "")).indexOf(" #3") >= 0 &&
                                    (f = f.replace(" #3", "")),
                                (o = "highwaisted_thong" == e ? "hwthong" : e),
                                "brief" == e ? ((o = "brief"), (i = "fcbrief"), (F = "//cdn.shopify.com/s/files/1/0313/4062/5964/files/" + f.replace(" ", "").toLowerCase() + "---" + i + "---prod-cb--2x.jpg")) : (i = "false"),
                                console.log("current custom box name if any", e),
                                (E = "//cdn.shopify.com/s/files/1/0313/4062/5964/files/" + f.replace(" ", "").toLowerCase() + "---" + o + "---prod-cb--2x.jpg");
                        }
                        let G = !1,
                            H = !1,
                            I = 0;
                        !0 == window.sideCartUpsellEnable &&
                            (window.sideCartUpsellProductId == c.product_id || window.sideCartUpsellProduct2Id == c.product_id || window.sideCartUpsellProduct3Id == c.product_id || window.sideCartUpsellProduct4Id == c.product_id) &&
                            !1 == k &&
                            ((H = !0), c.quantity >= 1 && c.quantity < 3 && ((G = !0), (I = 3 - c.quantity)));
                        let J = c.product_title;

                        /* edit - find all new variables for cart ui */
                        
                        var doesntHaveMembershipDiscounts = true,
                            hasNonMemberDiscounts = false,
                            subBoxOrigPrice = 0,
                            subscriptionProdSavings = 0,
                            totalSubItemAffectedSavingsRaw = 0,
                            totalOtherSavings = 0;
                      
                        if (c.discounts.length > 0) {
                          doesntHaveMembershipDiscounts = c.discounts.reduce(function (acc, discountObj) {
                              if (discountObj.title.indexOf("Member Discount") >= 0) {
                                  acc = false;
                              }
                            return acc;
                          }, doesntHaveMembershipDiscounts);
                          if (!!doesntHaveMembershipDiscounts) {
                            hasNonMemberDiscounts = true;
                            totalOtherSavings = c.discounts.reduce(function (acc, discountObj) {
                                if (discountObj.title.indexOf("Member Discount") < 0 && discountObj.title.indexOf("Subscription Item") < 0 && discountObj.title.indexOf("Subscription Item") < 0) {
                                    acc += discountObj.amount;
                                }
                              return acc;
                            }, totalOtherSavings);
                          }
                          subBoxOrigPrice = c.discounts.reduce(function (acc, discountObj) {
                              if (discountObj.title.indexOf("Member Discount") >= 0) {
                                  acc += c.original_price;
                              }
                            return acc;
                          }, subBoxOrigPrice);
                          totalSubItemAffectedSavingsRaw =  c.discounts.reduce(function (acc, discountObj) {
                              if (discountObj.title.indexOf("Member Discount") >= 0) {
                                  acc += discountObj.amount;
                              }
                              return acc;
                          }, totalSubItemAffectedSavingsRaw);
                          subscriptionProdSavings =  c.discounts.reduce(function (acc, discountObj) {
                              if (discountObj.title.indexOf("Member Discount") >= 0) {
                                  acc += c.total_discount;
                              }
                              return acc;
                          }, subscriptionProdSavings);
                        }
                        const checkBundleSet = (val) => {
                            const allKeys = Object.keys(val.properties);
                            if(allKeys.includes("isBundleSet") ){
                                return val.properties["isBundleSet"];
                            } else {
                                return ""
                            }
                        }

                        console.log(':edit: product item log', {
                          prod : c,
                          doesntHaveMembershipDiscounts: doesntHaveMembershipDiscounts,
                          hasNonMemberDiscounts: hasNonMemberDiscounts,
                          subBoxOrigPrice: subBoxOrigPrice,
                          subscriptionProdSavings: subscriptionProdSavings,
                          totalOtherSavings: totalOtherSavings
                        });
                        
                        if (
                            (c.product_type.indexOf("Mesh") >= 0 && (J = c.product_title.replace("Mesh", "Sheer").replace("Highwaisted", "HC Highwaisted")),
                            5343794233388 ==
                                (
                                  console.log('sps', isInMembershipBox),
                                  p = {
                                    id: c.variant_id,
                                    p_id: c.product_id,
                                    line: j + 1,
                                    url: c.url,
                                    img: r,
                                    name: !1 == D ? J : window.discountRulesCustomProductTile,
                                    variation: c.variant_title,
                                    properties: c.properties,
                                    itemAdd: c.quantity + 1,
                                    itemMinus: c.quantity - 1,
                                    itemQty: c.quantity,
                                    price: Shopify.formatMoney(c.price, settings.moneyFormat).replace(".00", ""),
                                    hasDiscount: C,
                                    totalSubItemAffectedSavingsRaw : totalSubItemAffectedSavingsRaw,
                                    subscriptionProdSavings: Shopify.formatMoney(subscriptionProdSavings, settings.moneyFormat).replace(".00", ""),
                                    subscriptionProdSavingsRaw: subscriptionProdSavings,
                                    totalOtherSavings: Shopify.formatMoney(totalOtherSavings, settings.moneyFormat).replace(".00", ""),
                                    totalOtherSavingsRaw: totalOtherSavings,
                                    hasSubscriberSavings: !doesntHaveMembershipDiscounts,
                                    canBeNudged: "", // no sub in cart and this item is in collection for this
                                    hasOtherSavingsOnly: hasNonMemberDiscounts,
                                    isInSubBox: "",
                                    hasOtherSavings: "",
                                    subBoxOrigPrice: Shopify.formatMoney(subBoxOrigPrice, settings.moneyFormat).replace(".00", ""),
                                    subBoxOrigPriceRaw: subBoxOrigPrice,
                                    subBoxFinalPrice: "$39",
                                    discountedPrice: Shopify.formatMoney(c.final_price, settings.moneyFormat).replace(".00", ""),
                                    originalTotal: Shopify.formatMoney(u, settings.moneyFormat).replace(".00", ""),
                                    itemTotal: Shopify.formatMoney(g, settings.moneyFormat).replace(".00", ""),
                                    hasSavingsAmount: Shopify.formatMoney((u-g), settings.moneyFormat).replace(".00", "") !== "$0",
                                    savingsAmount: Shopify.formatMoney((u-g), settings.moneyFormat).replace(".00", ""),
                                    vendor: c.vendor,
                                    productType: c.product_type,
                                    productFabric: vela.ebyProdTitleFormatter(c.product_title, "fabric"),
                                    productStyle: vela.ebyProdTitleFormatter(c.product_title, "style"),
                                    productColor: vela.ebyProdTitleFormatter(c.product_title, "color"),
                                    productFreeGift: D,
                                    isHiddenCollateral: K,
                                    isIncludedInCustomBox: k,
                                    isIncludedInMembershipBox: isInMembershipBox,
                                    prodSku: c.sku,
                                    prodId: c.product_id,
                                    isLdsLastPackItem: M,
                                    customBoxImg: E,
                                    isBra: c.product_type.indexOf("Bra") >= 0,
                                    bra_measurements: !!c.properties['bra_measurements'] ? c.properties['bra_measurements'].replace('::', ' ') : "",
                                    customBoxIsPlus: "false" !== i,
                                    customBoxPlusImg: F,
                                    isLtd: L,
                                    isSubscriptionMembership: c.product_title.indexOf("Subscription") >= 0,
                                    membershipPlan: c.product_title.indexOf("Quarterly") >= 0 ? "quarterly" : "semi-annual",
                                    membershipName: c.title.replace("EBY Subscription - ", "").slice(0, c.title.replace("EBY Subscription - ", "").indexOf(" (")).replace('EBY ', '').replace(' Subscription', '') + " Box",
                                    state_ralated_product: N,
                                    number_related: O,
                                    isUpsell: G,
                                    isProductUpsell: H,
                                    isUpsellQty: I,
                                    isBundleSet: checkBundleSet(c)
                                }).prodId && (p.showIcon = !0),
                            p.properties)
                        )
                            for (var d in p.properties)
                                "build_id" == d && ((p.buildIDs = p.properties[d]), delete p.properties[d]),
                                    "_" === d[0] && delete p.properties[d],
                                    "Shipping Option" == d && delete p.properties[d],
                                    "shipping_interval_unit_type" == d && delete p.properties[d],
                                    "shipping_interval_frequency" == d && delete p.properties[d],
                                    "bundle_" == d && ((p.bundle = !0), w.push({ v: c.variant_title, q: c.quantity }), delete p.properties[d]),
                                    "bundle_ids" == d && ((p.bundleIDS = p.properties[d]), delete p.properties[d]),
                                    "sub_bundle" == d && ((p.subbundle = !0), x.push({ v: c.variant_title, k: j + 1, q: c.quantity }), delete p.properties[d]),
                                    "product_type" == d && "Main Subscription" == p.properties[d] && ((p.subscription = !0), y.push({ v: c.variant_title, q: c.quantity }), delete p.properties[d]),
                                    "subscription_ids" == d &&
                                        ((m = !0), (a.original_total_price -= c.line_level_total_discount), (a.total_discount -= c.line_level_total_discount), (p.subscriptionIDs = p.properties[d]), delete p.properties[d]),
                                    "included_in_pack" == d && ((a.original_total_price -= c.original_line_price), (a.total_discount -= c.line_level_total_discount)),
                                    (("product_type" == d && "Sub Subscription" == p.properties[d]) || ("included_in_custombox" == d && "true" == p.properties[d]) || ("included_in_membershipbox" == d && "true" == p.properties[d])) &&
                                        (console.log("altering price of cart items"),
                                        (a.original_total_price -= c.original_line_price),
                                        (a.total_discount -= c.line_level_total_discount),
                                        (l += c.final_line_price),
                                        (p.subsubscription = p.properties[d]),
                                        z.push({ v: c.variant_title, k: j + 1, q: c.quantity }),
                                        delete p.properties[d]),
                                    "hidden_collateral" == d && delete p.properties[d];
                        h.push(p);
                    });
                var d = !1,
                    k = 500,
                    totalSubBoxSavings = 0,
                    totalSubcriberSavings = 0,
                    totalOtherSavingsFinal = 0,
                    totalSubItemsAffectedSavings = 0,
                    totalSubBoxOrigPrice = 0;
                var hasPriorityShipping = (a.total_price / 100) >= 125,
                    hasFreeShipping = false,
                    hasStandardShipping = true,
                    totalOnetimes = 0;
              
                void 0 != window.ShopifyAnalytics.meta.page.customerId ? ((d = !0), (b = 0)) : (d = "function" == typeof checkBalanceValue && 0 >= checkBalanceValue(a.total_price / 100)),
                    "Subscription Box" == a.attributes["Product Type"] && ((d = !0), (b = 0)),
                    (!0 == d || !0 == m) && (k = 0),
                    (
                      totalSubBoxSavings = h.reduce(function (acc, updatedItem) {
                          if (!!updatedItem.subscriptionProdSavingsRaw && (!!updatedItem.isIncludedInMembershipBox || !!updatedItem.isIncludedInCustomBox)) {
                              acc += updatedItem.subscriptionProdSavingsRaw;
                          }
                        return acc;
                      }, totalSubBoxSavings),
                      totalOnetimes = h.reduce(function (acc, updatedItem) {
                          if (!updatedItem.isSubscriptionMembership && !updatedItem.isIncludedInMembershipBox && !updatedItem.isIncludedInCustomBox) {
                              acc += 1;
                          }
                        return acc;
                      }, totalOnetimes),
                      totalSubcriberSavings = h.reduce(function (acc, updatedItem) {
                          if (!!updatedItem.subscriptionProdSavingsRaw && (!!updatedItem.isIncludedInMembershipBox || !!updatedItem.isIncludedInCustomBox)) {
                              acc += updatedItem.subscriptionProdSavingsRaw;
                          }
                        return acc;
                      }, totalSubcriberSavings),
                      totalSubItemsAffectedSavings = h.reduce(function (acc, updatedItem) {
                          if (!!updatedItem.subscriptionProdSavingsRaw) {
                              acc += updatedItem.subscriptionProdSavingsRaw;
                          }
                        return acc;
                      }, totalSubItemsAffectedSavings),
                      totalOtherSavingsFinal = h.reduce(function (acc, updatedItem) {
                          if (!!updatedItem.totalOtherSavingsRaw && !updatedItem.isSubscriptionMembership) {
                              acc += updatedItem.totalOtherSavingsRaw;
                          }
                        return acc;
                      }, totalOtherSavingsFinal),
                      totalSubBoxOrigPrice = h.reduce(function (acc, updatedItem) {
                          if (!!updatedItem.subBoxOrigPriceRaw && (!!updatedItem.isIncludedInMembershipBox || !!updatedItem.isIncludedInCustomBox)) {
                              acc += updatedItem.subBoxOrigPriceRaw;
                          }
                        return acc;
                      }, totalSubBoxOrigPrice),
                      hasFreeShipping = !!d ? d : !!m ? m : false,
                      hasStandardShipping = !hasFreeShipping && !hasPriorityShipping,
                      console.log(': temp variables :', {
                        totalSubBoxOrigPrice: totalSubBoxOrigPrice,
                        totalSubBoxSavings: totalSubBoxSavings,
                        hasFreeShipping: hasFreeShipping,
                        hasStandardShipping: hasStandardShipping
                      }),
                      vela.currentSubCost = Shopify.formatMoney(totalSubBoxOrigPrice, settings.moneyFormat).replace(".00", ""),
                      c = {
                        items: h,
                        note: a.note,
                        isCanada: document.getElementById("canadaVersion"),
                        hasSubscriptionInCart: m,
                        hasOnetimesInCart: totalOnetimes > 0,
                        trueEcommTotalWithoutShipping: Shopify.formatMoney((a.total_price - l - b) + ((totalSubItemsAffectedSavings) + totalOtherSavingsFinal), settings.moneyFormat).replace(".00", ""),
                        trueEcommSubtotalWithShipping: !!hasStandardShipping ? Shopify.formatMoney((a.total_price - l - b) + (500 + totalOtherSavingsFinal), settings.moneyFormat).replace(".00", "") : Shopify.formatMoney((a.total_price - l - b) + ( + totalOtherSavingsFinal), settings.moneyFormat).replace(".00", ""),
                        trueEcommTotalWithShipping: Shopify.formatMoney(a.total_price - l + k - b, settings.moneyFormat).replace(".00", ""),
                        trueSubTotal: Shopify.formatMoney((a.total_price - l + k - b) + ((totalSubItemsAffectedSavings - 3900) + totalOtherSavingsFinal), settings.moneyFormat).replace(".00", ""),
                        totalSubItemsAffectedSavings: Shopify.formatMoney(totalSubItemsAffectedSavings - 3900, settings.moneyFormat).replace(".00", ""),
                        totalOtherSavingsFinal : Shopify.formatMoney(totalOtherSavingsFinal, settings.moneyFormat).replace(".00", ""),
                        totalEbySavings: Shopify.formatMoney((totalSubItemsAffectedSavings - 3900) + totalOtherSavingsFinal, settings.moneyFormat).replace(".00", ""),
                        totalEbyEcommSavings: Shopify.formatMoney((totalSubItemsAffectedSavings) + totalOtherSavingsFinal, settings.moneyFormat).replace(".00", ""),
                        totalSubBoxSavings: Shopify.formatMoney(totalSubBoxSavings - 3900, settings.moneyFormat).replace(".00", ""),
                        totalSubBoxOrigPrice: Shopify.formatMoney(totalSubBoxOrigPrice, settings.moneyFormat).replace(".00", ""),
                        totalPriceWithoutShipping: Shopify.formatMoney(a.total_price - l - b, settings.moneyFormat).replace(".00", ""),
                        showDiscountsOff: +a.total_discount + b > 0,
                        totalOriginal: Shopify.formatMoney(a.original_total_price, settings.moneyFormat).replace(".00", ""),
                        totalDiscount: Shopify.formatMoney(+a.total_discount + b, settings.moneyFormat).replace(".00", ""),
                        totalPrice: Shopify.formatMoney(a.total_price - l + k - b, settings.moneyFormat).replace(".00", ""),
                        shippingValue: Shopify.formatMoney(k, settings.moneyFormat).replace(".00", ""),
                        isFreeShipping: !!d ? d : !!m ? m : false,
                        hasPriorityShipping: hasPriorityShipping,
                        hasStandardShipping: hasStandardShipping,
                        hasCustomBoxMembership: n,
                        customBoxMembershipFrequencyQuarterly: s,
                        customBoxMembershipFrequencySemiAnnual: t,
                        showCustomBoxMembership: r,
                        customBoxMembershipVariantId: u,
                        customBoxMembershipSizeGroup: v,
                    }),
                    $(".cartIndicator").removeClass("ebyMinicartEmptyCount").addClass("ebyMinicartHasCount"),
                    $(".velaCartTop").removeClass("empty").addClass("avail"),
                    $(".ebyMicroBtn.joinNow").removeClass("join").addClass("buy"),
                    $(".header-minicart-wrapper").removeClass("shop").addClass("checkout"),
                    $(".header-checkoutbtn-wrapper").removeClass("shop").addClass("checkout"),
                    $cartContainer.append(j(c)),
                    $cartContainer.find(".gamification.wrapper").length && null != e && (e = $cartContainer.find(".gamification.wrapper").replaceWith(e)),
                    submitAjaxCart(),
                    cartCallback(o, f, g);
            }
            /*
            $.ajax({
                url: "/cart?view=mystry",
                data: '',
                success: function (a) {
                    var htmlSnippet = document.createElement('template');
                    htmlSnippet.innerHTML = JSON.parse(a.trim())[0];
                    $("#mystry_product").html(htmlSnippet.innerHTML);
                },
                dataType: "html"
            });
            */
            jQuery('#sub-box-org-price-text s').text(vela.currentSubCost);
        }),
        (submitAjaxCart = function () {
            function a() {
                if (!1 != isUpdating) return !1;
                var a = !0;
                $.ajax({
                    type: "GET",
                    url: "/cart.json",
                    async: !1,
                    dataType: "json",
                    success: function (b) {
                        if ("function" == typeof bFreeGiftProduct) {
                            if (!0 == (a = bFreeGiftProduct(b, !!$("body").hasClass("template-cart"), !0)).foundMoreFreeGift && !0 == $("body").hasClass("template-cart"))
                                return (
                                    $('.cart.ajaxcart__form.ajaxcart [type="submit"]').addClass("disabled").attr("disabled", "disabled"),
                                    $(".cart.ajaxcart__form.ajaxcart .btn.btnVelaCart.btnCheckout").addClass("disabled").attr("disabled", "disabled"),
                                    $(".cart.ajaxcart__form.ajaxcart").addClass("disabled").attr("disabled", "disabled"),
                                    !1
                                );
                            var c = !1;
                            if (
                                (b.items.map((b) => {
                                    var a = b.properties;
                                    a && "Main Subscription" === a.product_type && (c = !0);
                                }),
                                !c)
                            ) {
                                let f = "/checkout",
                                    d = "";
                                return void 0 != a.attributes && void 0 != a.attributes["Discount code"] && (d = a.attributes["Discount code"]), "" != d && (f = "/discount/" + d + "?redirect=/checkout"), (window.location = f), !1;
                            }
                        } else {
                            var c = !1;
                            if (
                                (b.items.map((b) => {
                                    var a = b.properties;
                                    a && "Main Subscription" === a.product_type && (c = !0);
                                }),
                                !c)
                            ) {
                                let g = "/checkout",
                                    e = "";
                                return void 0 != a.attributes && void 0 != a.attributes["Discount code"] && (e = a.attributes["Discount code"]), "" != e && (g = "/discount/" + e + "?redirect=/checkout"), (window.location = g), !1;
                            }
                        }
                    },
                });
            }
            $(".cart.ajaxcart .btn.btnVelaCart.btnCheckout").click(function (b) {
                b.preventDefault(), a();
            }),
                $('.cart.ajaxcart [type="submit"]').click(function (b) {
                    b.preventDefault(), a();
                });
        }),
        (cartCallback = function (a, b, c) {
            if ((void 0 === b && (b = !1), void 0 === c && (c = !1), "function" == typeof Shopify.gamification.bUpdateGamification)) {
                let d = Shopify.gamification.bUpdateGamification(a, !0, b, c);
                null != d && (a = d);
            }
            $(".motivator-bar").length > 0 && checkMotivatorBanner(a.total_price / 100),
                $body.removeClass("drawerIsLoading"),
                void 0 != window.Rebuy && window.Rebuy.init(),
                $body.trigger("ajaxCart.afterCartLoad", a),
                window.Shopify && Shopify.StorefrontExpressButtons && Shopify.StorefrontExpressButtons.initialize();
        }),
        (adjustCart = function () {
                function grabSecondBndlSet(line, sync){
                    let firstElement = document.querySelector(`.drawerProduct.ajaxCartRow[data-prop='${sync}'][data-line='${line}']`);
                    let elements = Array.from(document.querySelectorAll(`.drawerProduct.ajaxCartRow[data-prop='${sync}']`));
                    let secondElement = elements.filter(el => el !== firstElement)[0];
                    
                    return secondElement.dataset.line;
                }
                $body.on("click", ".qtyAdjust", function () {
                    var f = $(this),
                        c = f.data("line"),
                        e = f.siblings(".qtyNum"),
                        h = e.data("prop"),
                        d = e.data("upsell"),
                        b = parseInt(e.val().replace(/\D/g, "")),
                        b = validateQty(b);
                    if ((f.hasClass("velaQtyPlus") ? (b += 1) : ((b -= 1) <= 0 && (b = 0), !0 == d && (d = !1)), $(".ajaxCartProduct.related").length > 0)) {
                        let g = $(this).closest(".related").attr("data-related-id"),
                            i = $(this)
                                .closest(".related")
                                .siblings('[data-related-id="' + g + '"]')
                                .find(".ajaxCartRow")
                                .attr("data-line");
                        $(this)
                            .closest(".related")
                            .siblings('[data-related-id="' + g + '"]')
                            .find(".ajaxCartRow")
                            .attr("data-vid");
                        var j = $('.ajaxCartRow[data-line="' + c + '"]').addClass("is-loading");
                        if ((0 === b && j.parent().addClass("is-removed"), i)) {
                            var k = $('.ajaxCartRow[data-line="' + g + '"]').addClass("is-loading");
                            0 === b && k.parent().addClass("is-removed"),
                                ShopifyAPI.changeItem(c, b, function (a) {
                                    let d,
                                        e = !1;
                                    $.each(a.items, function (f, a) {
                                        if (
                                            ((0 === b || (0 !== b && c != f + 1)) &&
                                                null !== a.properties &&
                                                $.each(a.properties, function (a, b) {
                                                    if ("Related product" == a && b == g) return (e = !0), (d = f + 1), !1;
                                                }),
                                            !0 == e)
                                        )
                                            return !1;
                                    }),
                                        !0 == e && ShopifyAPI.changeItem(d, b, adjustCartCallback);
                                });
                        } else ShopifyAPI.changeItem(c, b, adjustCartCallback);
                    } else if (c) {
                        // fc 061623
                        if(f.closest(".ajaxCartProduct").hasClass("isBundleSet")){
                            const dataProp = f.closest(".drawerProduct.ajaxCartRow").data("prop");

                            if( typeof dataProp === 'string'){ 

                                const lineBndlSet = +grabSecondBndlSet(c, dataProp);
                                a(c, b, true)
                                setTimeout(() => a(lineBndlSet, b, true), 200);
                            } else{ a(c, b + 1, d); }
                        } else {

                            if ("" == h) d ? a(c, b, d) : a(c, b, !1);
                            else {
                                var l = h.split(","),
                                    m = [];
                                $(l).each(function (c, a) {
                                    m.push("updates[" + a + "]=" + b);
                                }),
                                    a(c, b, d),
                                    jQuery.post("/cart/update.js", m.join("&"));
                            }
                        }

                        
                    } else e.val(b);
                }),
                $body.on("change", ".qtyNum", function () {
                    var d = $(this),
                        c = d.data("line"),
                        f = d.data("prop"),
                        g = d.data("upsell"),
                        b = parseInt(d.val().replace(/\D/g, "")),
                        b = validateQty(b);
                    if ($(".ajaxCartProduct.related").length > 0) {
                        let e = $(this).closest(".related").attr("data-related-id"),
                            h = $(this)
                                .closest(".related")
                                .siblings('[data-related-id="' + e + '"]')
                                .find(".ajaxCartRow")
                                .attr("data-line");
                        $(this)
                            .closest(".related")
                            .siblings('[data-related-id="' + e + '"]')
                            .find(".ajaxCartRow")
                            .attr("data-vid");
                        var i = $('.ajaxCartRow[data-line="' + c + '"]').addClass("is-loading");
                        if ((0 === b && i.parent().addClass("is-removed"), h)) {

                            var j = $('.ajaxCartRow[data-line="' + e + '"]').addClass("is-loading");
                            0 === b && j.parent().addClass("is-removed"),
                                ShopifyAPI.changeItem(c, b, function (a) {
                                    let d,
                                        f = !1;
                                    $.each(a.items, function (g, a) {
                                        if (
                                            ((0 === b || (0 !== b && c != g + 1)) &&
                                                null !== a.properties &&
                                                $.each(a.properties, function (a, b) {
                                                    if ("Related product" == a && b == e) return (f = !0), (d = g + 1), !1;
                                                }),
                                            !0 == f)
                                        )
                                            return !1;
                                    }),
                                        !0 == f && ShopifyAPI.changeItem(d, b, adjustCartCallback);
                                });
                        } else ShopifyAPI.changeItem(c, b, adjustCartCallback);
                    } else if (c) {
                        // fc 061623
                        debugger
                        if(d.closest(".ajaxCartProduct").hasClass("isBundleSet")){
                            const dataProp = d.closest(".drawerProduct.ajaxCartRow").data("prop");
                            
                            if( typeof dataProp === 'string' ){ 

                                const lineBndlSet = +grabSecondBndlSet(c, dataProp);
                                a(c, b, true)
                                setTimeout(() => a(lineBndlSet, b, true), 200);
                            } else{
                                if (b % 2 != 0) {
                                    b += 1;
                                } 
                                a(c, b, d); 
                            }

                        } else {
                            if ("" == f) a(c, b, g);
                            else {
                                var k = f.split(","),
                                    l = [];
                                $(k).each(function (c, a) {
                                    l.push("updates[" + a + "]=" + b);
                                }),
                                    a(c, b, g),
                                    jQuery.post("/cart/update.js", l.join("&"));
                            }
                        }
                    }
                }),
                $body.on("submit", "form.ajaxcart", function (a) {
                    isUpdating && a.preventDefault();
                }),
                $body.on("focus", ".qtyAdjust", function () {
                    var a = $(this);
                    setTimeout(function () {
                        a.select();
                    }, 50);
                }),
                $body.on("click", ".cartRemove", function () {
                    var b = $(this),
                        c = b.data("line"),
                        e = b.data("prop"),
                        d = 0;
                    if ($(".ajaxCartProduct.related").length > 0) {
                        let f = $(this).closest(".related").attr("data-related-id"),
                            g = $(this)
                                .closest(".related")
                                .siblings('[data-related-id="' + f + '"]')
                                .find(".ajaxCartRow")
                                .attr("data-line");
                        $(this)
                            .closest(".related")
                            .siblings('[data-related-id="' + f + '"]')
                            .find(".ajaxCartRow")
                            .attr("data-vid");
                        var h = $('.ajaxCartRow[data-line="' + c + '"]').addClass("is-loading");
                        if ((0 === d && h.parent().addClass("is-removed"), g)) {
                            var i = $('.ajaxCartRow[data-line="' + f + '"]').addClass("is-loading");
                            0 === d && i.parent().addClass("is-removed"),
                                ShopifyAPI.changeItem(c, d, function (a) {
                                    let b,
                                        e = !1;
                                    $.each(a.items, function (g, a) {
                                        if (
                                            ((0 === d || (0 !== d && c != g + 1)) &&
                                                null !== a.properties &&
                                                $.each(a.properties, function (a, c) {
                                                    if ("Related product" == a && c == f) return (e = !0), (b = g + 1), !1;
                                                }),
                                            !0 == e)
                                        )
                                            return !1;
                                    }),
                                        !0 == e && ShopifyAPI.changeItem(b, d, adjustCartCallback);
                                });
                        } else ShopifyAPI.changeItem(c, d, adjustCartCallback);
                    } else if (c) {
                        if ("" == e || void 0 == e) {
                            if ("buildapack_child" === b.attr("data-prdtype")) {
                                var j = [];
                                ShopifyAPI.getCart(function (b) {
                                    console.log(":: cart received ::", b),
                                        b.items.map(function (a, b) {
                                            a.properties.build_a_pack && j.push(a.id);
                                        });
                                    for (var c = j, e = 0, d = { updates: {} }, a = 0; a < c.length; a++) d.updates[c[a]] = e;
                                    jQuery.ajax({
                                        type: "POST",
                                        url: "/cart/update.js",
                                        data: d,
                                        dataType: "json",
                                        success: function (a) {
                                            console.log("success!", a), ShopifyAPI.onCartUpdate(a), adjustCartCallback(a);
                                        },
                                    });
                                });
                            } else if (b.closest(".ajaxCartProduct").hasClass("packParentProd")) {
                                console.log(":: remove a pack ::", b);
                                var j = [];
                                ShopifyAPI.getCart(function (c) {
                                    console.log(":: cart received ::", c),
                                        c.items.map(function (a, b) {
                                            (a.properties.included_in_pack || a.properties.mystery_pack) && j.push(a.id);
                                        });
                                    for (var d = j, e = 0, a = { updates: {} }, b = 0; b < d.length; b++) a.updates[d[b]] = e;
                                    (a.attributes = { has_mystery_pack: !1 }),
                                        jQuery.ajax({
                                            type: "POST",
                                            url: "/cart/update.js",
                                            data: a,
                                            dataType: "json",
                                            success: function (a) {
                                                console.log("success!", a), ShopifyAPI.onCartUpdate(a), adjustCartCallback(a);
                                            },
                                        });
                                });
                            } else if (b.closest(".ajaxCartProduct").hasClass("isBundleSet")) {
                                // fc 061623
                                console.log(":: remove a pack/set::", b);
                                var j = [];
 
                                const dataPropValue = this.closest('.drawerProduct.ajaxCartRow').dataset.prop;
                                ShopifyAPI.getCart(function (c) {
                                    c.items.map(function (a, b) {
                                        if(a.properties.isBundleSet == dataPropValue){
                                            j.push(a.id)
                                        }
                                    });
                                    for (var d = j, e = 0, a = { updates: {} }, b = 0; b < d.length; b++) a.updates[d[b]] = e;
                                    jQuery.ajax({
                                        type: "POST",
                                        url: "/cart/update.js",
                                        data: a,
                                        dataType: "json",
                                        success: function (a) {
                                            console.log("success!", a), ShopifyAPI.onCartUpdate(a), adjustCartCallback(a);
                                        },
                                    });
                                });
                            } else
                                a(c, d, function (a) {
                                    ShopifyAPI.onCartUpdate(a), adjustCartCallback(a);
                                });
                        } else {
                            var k = e.split(","),
                                l = [],
                                m = b.data("packIds");
                            ShopifyAPI.getCart(function (c) {
                                console.log(":: cart received ::", c);
                                var d = c.items.map(function (a, c) {
                                        ((a.properties.sub_bundle && k.indexOf(a.id.toString()) >= 0) ||
                                            (b.hasClass("ldsPackItem") && m.split(",").indexOf(a.id) >= 0) ||
                                            a.properties.included_in_custombox ||
                                            a.properties.included_in_membershipbox ||
                                            "Sub Subscription" == a.properties.product_type ||
                                            k.indexOf(a.id.toString()) >= 0) &&
                                            l.push("updates[" + a.id + "]=0");
                                    }),
                                    e = "subscription" === jQuery('.ajaxCartRow[data-line="' + b.data("line") + '"]').data("prop");
                                l.push("updates[" + b.attr('data-vid') + "]=0");
                                let a = l.join("&");
                                (a += "&attributes[has_cb_membership]=false"),
                                    console.log(":: removed new prod data ::", a),
                                    jQuery.ajax({
                                        type: "POST",
                                        url: "/cart/update.js",
                                        data: a,
                                        dataType: "json",
                                        success: function (a) {
                                            console.log("success!", a),
                                                ShopifyAPI.onCartUpdate(a),
                                                adjustCartCallback(a),
                                                e &&
                                                    setTimeout(function () {
                                                        jQuery(".btnCheckout.r-btn").hide(), jQuery(".shopCheckoutBtn").removeClass("hidden");
                                                    }, 1500);
                                        },
                                    });
                            });
                        }
                    }
                }),
                $body.on("click", ".mystryAdd", function (d) {
                    d.preventDefault();
                    var a = $(this).data("ids"),
                        c = $(this).data("size");
                    let b = "";
                    $(this).find("span").html("..."),
                        a.length > 0
                            ? ((b = a.slice(0, a.length - 1).split(",")),
                              jQuery.ajax({
                                  type: "POST",
                                  crossDomain: !0,
                                  url: window.APIDomain + window.otherAPI + "eby_stockcheck-filters_update.php",
                                  data: { data: { variantOpt: "pantySize", variantOptVal: c, variantOptsVals: c + "::xs::xs", prodListCount: b.length, prodIdList: b.join(","), warehouseKey: "ecomm" } },
                                  dataType: "json",
                                  headers: { Authorization: "Bearer ddd345d2498c7717a7bbbe86d9d145dc", "Access-Control-Allow-Origin": "*" },
                                  success: function (a) {
                                      if ((console.log("::stockcheck success::", a), a)) {
                                          let b = "",
                                              e = a.inventoryHealthcheck;
                                          a.prodInventoryData;
                                          let f = {};
                                          f.Mystry_Collection = "Mystry Product";
                                          for (let d = 0; d < e.length; d++)
                                              if (e[d].available > 0) {
                                                  b = a.prodInventoryData.reduce(function (a, b) {
                                                      return b.inventory_item_id === e[d].inventory_item_id && (a = b.variantId), a;
                                                  }, "");
                                                  break;
                                              }
                                          console.log(":: mp, first avail prod ::", b),
                                              "" === b && window.ga("send", "event", { eventCategory: "mystery_panty-stock_check", eventLabel: "out_of_stock-" + c, eventAction: "add_to_cart", eventValue: "" }),
                                              jQuery.ajax({
                                                  type: "POST",
                                                  url: "/cart/add.js",
                                                  data: { quantity: 1, id: b, properties: f },
                                                  dataType: "json",
                                                  async: !1,
                                                  error: function (a, b, c) {
                                                      console.log("::error:: ", { jqXHR: a, textStatus: b, errorThrown: c });
                                                  },
                                                  success: function (a) {
                                                      $(".mystry_product").addClass("hide"),
                                                          $(".mystryAdd").find("span").html("Add!"),
                                                          window.gtag("event", "addToCart", { event_category: "freeAdd-mysteryPanty", event_label: "mysteryPanty", event_value: "5.00" }),
                                                          console.log("::log mp add::"),
                                                          ShopifyAPI.getCart(cartUpdateCallback);
                                                  },
                                              });
                                      }
                                  },
                                  error: function (a, b) {
                                      console.log("::stockcheck failure::", { text: b, xhr: a });
                                  },
                              }))
                            : console.log(":: error :: mystery panties ran out.");
                }),
                $body.on("click", ".mysteryPackAddToCartBtn", function (c) {
                    c.preventDefault();
                    let d = jQuery("#hidden_mpid").val(),
                        g = jQuery(c.target).closest(".formAddToCart").find(".selector-wrapper option:selected").val(),
                        e = jQuery("#hidden_mpo-" + d)
                            .val()
                            .slice(2),
                        f = jQuery("#productSelect option:selected").val();
                    console.log(":: mystery pack atc ::", d), console.log(":: mystery pack atc ::", g), console.log(":: mystery pack atc ::", e);
                    let h = e.split("::"),
                        i = "",
                        j = h.reduce(function (e, a) {
                            let b = a.replace("mpProds_", "");
                            if ((console.log(":: varId for pack ::", b), b.slice(0, 2) === g)) {
                                let f = { included_in_pack: !0, "Shipping Option": "pickup Ecommerce WH" },
                                    c = "mpProds_" + g + "-";
                                i = a.replace(c, "");
                                let d = a.replace(c, "").split(":");
                                console.log(":: varId for chain ::", d),
                                    d.map(function (a) {
                                        console.log(":: varChainId added ::", a), e.push({ quantity: 1, id: a, properties: f });
                                    });
                            }
                            return e;
                        }, []),
                        a = { "Shipping Option": "pickup Ecommerce WH", mystery_pack: "true" };
                    (a.pack_ids = i.split(":").join(",")), (a.pack_ids = f + "," + a.pack_ids);
                    let b = { attributes: { has_mystery_pack: "true" }, items: [{ quantity: 1, id: f, properties: a }] };
                    (b.items = b.items.concat(j).reverse()),
                        jQuery("body").addClass("velaCartAdding"),
                        jQuery.ajax({
                            type: "POST",
                            url: "/cart/add.js",
                            data: b,
                            dataType: "json",
                            success: function (a) {
                                console.log(":: mysteryPack and prods added to cart ::", { data: a }), jQuery("body").removeClass("velaCartAdding"), ShopifyAPI.getCart(cartUpdateCallback);
                            },
                            error: function (a, b) {
                                console.log(":: mysteryPack addToCart failure ::", { text: b, xhr: a }), jQuery("body").removeClass("velaCartAdding"), a.responseJSON && alert(a.responseJSON.description);
                            },
                        });
                }),
                $body.on("click", ".mysteryPackQuickAddForm .btnAddToCart", function (c) {
                    c.preventDefault();
                    let d = jQuery(c.target).closest(".mysteryPackQuickAddForm").attr("data-prdid"),
                        h = jQuery(this).closest(".mysteryPackQuickAddForm").find(".swatch-element input:checked")[0].value,
                        e = jQuery("#hidden_mpo-" + d)
                            .val()
                            .slice(2),
                        f = jQuery(this).closest(".mysteryPackQuickAddForm").find(".swatch-element input:checked")[0].id.replace("quickview-swatch-", ""),
                        g = f.slice(0, f.indexOf("-"));
                    console.log(":: mystery pack qatc ::", d), console.log(":: mystery pack qatc ::", h), console.log(":: mystery pack qatc ::", e);
                    let i = e.split("::"),
                        j = "",
                        k = i.reduce(function (e, a) {
                            let b = a.replace("mpProds_", "");
                            if ((console.log(":: varId for pack ::", b), b.slice(0, 2) === h)) {
                                let f = { included_in_pack: !0, "Shipping Option": "pickup Ecommerce WH" },
                                    c = "mpProds_" + h + "-";
                                j = a.replace(c, "");
                                let d = a.replace(c, "").split(":");
                                console.log(":: varId for chain ::", d),
                                    d.map(function (a) {
                                        console.log(":: varChainId added ::", a), e.push({ quantity: 1, id: a, properties: f });
                                    });
                            }
                            return e;
                        }, []),
                        a = { "Shipping Option": "pickup Ecommerce WH", mystery_pack: "true" };
                    (a.pack_ids = j.split(":").join(",")), (a.pack_ids = g + "," + a.pack_ids);
                    let b = { attributes: { has_mystery_pack: "true" }, items: [{ quantity: 1, id: g, properties: a }] };
                    (b.items = b.items.concat(k).reverse()),
                        jQuery("body").addClass("velaCartAdding"),
                        jQuery.ajax({
                            type: "POST",
                            url: "/cart/add.js",
                            data: b,
                            dataType: "json",
                            success: function (a) {
                                console.log(":: mysteryPack and prods added to cart ::", { data: a }), jQuery("body").removeClass("velaCartAdding"), ShopifyAPI.getCart(cartUpdateCallback);
                            },
                            error: function (a, b) {
                                console.log(":: mysteryPack addToCart failure ::", { text: b, xhr: a }), jQuery("body").removeClass("velaCartAdding"), a.responseJSON && alert(a.responseJSON.description);
                            },
                        });
                }),
                $body.on("click", ".mysteryPackQuickAddToCartWrapper .swatch-element label", function (a) {
                    a.preventDefault();
                    let d = jQuery(a.target).closest(".velaProBlockInner").find(".hidden_mpid").val(),
                        h = jQuery(a.target).closest(".swatch-element").data("value"),
                        e = jQuery("#hidden_mpo-" + d)
                            .val()
                            .slice(2),
                        f = a.target.getAttribute("for").replace("quickview-swatch-", ""),
                        g = f.slice(0, f.indexOf("-"));
                    console.log(":: mystery pack qatc ::", d), console.log(":: mystery pack qatc ::", h), console.log(":: mystery pack qatc ::", e);
                    let i = e.split("::"),
                        j = "",
                        k = i.reduce(function (e, a) {
                            let b = a.replace("mpProds_", "");
                            if ((console.log(":: varId for pack ::", b), b.slice(0, 2) === h)) {
                                let f = { included_in_pack: !0, "Shipping Option": "pickup Ecommerce WH" },
                                    c = "mpProds_" + h + "-";
                                j = a.replace(c, "");
                                let d = a.replace(c, "").split(":");
                                console.log(":: varId for chain ::", d),
                                    d.map(function (a) {
                                        console.log(":: varChainId added ::", a), e.push({ quantity: 1, id: a, properties: f });
                                    });
                            }
                            return e;
                        }, []),
                        b = { "Shipping Option": "pickup Ecommerce WH", mystery_pack: "true" };
                    (b.pack_ids = j.split(":").join(",")), (b.pack_ids = g + "," + b.pack_ids);
                    let c = { attributes: { has_mystery_pack: "true" }, items: [{ quantity: 1, id: g, properties: b }] };
                    (c.items = c.items.concat(k).reverse()),
                        jQuery("body").addClass("velaCartAdding"),
                        jQuery.ajax({
                            type: "POST",
                            url: "/cart/add.js",
                            data: c,
                            dataType: "json",
                            success: function (a) {
                                console.log(":: mysteryPack and prods added to cart ::", { data: a }), jQuery("body").removeClass("velaCartAdding"), ShopifyAPI.getCart(cartUpdateCallback);
                            },
                            error: function (a, b) {
                                console.log(":: mysteryPack addToCart failure ::", { text: b, xhr: a }), jQuery("body").removeClass("velaCartAdding"), a.responseJSON && alert(a.responseJSON.description);
                            },
                        });
                }),
                $body.on("click", ".cartUpsellAdd", function () {
                    var b = $(this).data("line"),
                        c = $(this).data("qty");
                    b && a(b, c, !0);
                });
            var a = function (b, c, a) {
                void 0 === a && (a = !1), (isUpdating = !0);
                // / fc 061623
                var d = $('.ajaxCartRow[data-line="' + b + '"]').addClass("is-loading");
                0 === c && d.parent().addClass("is-removed"),
                    $("body").hasClass("template-cart")
                        ? (ShopifyAPI.changeItem(b, c, !1, a),
                          setTimeout(function () {
                            console.log('b1', b);
                            console.log('c1', c);
                            console.log('a1', a);
                              location.reload();
                          }, 500))
                        : setTimeout(function () {
                            console.log('b2', b);
                            console.log('c2', c);
                            console.log('a2', a);
                              ShopifyAPI.changeItem(b, c, adjustCartCallback, a);
                          }, 250);
            };
            $body.on("change", 'textarea[name="note"]', function () {
                var a = $(this).val();
                ShopifyAPI.updateCartNote(a, function (a) {});
            }),
                $body.on("change", ".ajaxcart__form-subs", function () {
                    let a = $(this),
                        e = a.val(),
                        b = a.data("variantId"),
                        d = a.data("sizeGroup");
                    if ("true" == e) {
                        let c = $("#ajaxcart__form-subs_shipping_interval_frequency").val();
                        console.log("variantId", b, "sizeGroup", d, "planGroup", c),
                            null != b && null != c && (vela.RightDrawer.close(), vela.addEbyMembershipBox("pdp", { styleGroup: null, colorGroup: null, sizeGroup: d, planGroup: c, prodsOfInterest: [b] }));
                    }
                });
        }),
        (adjustCartCallback = function (a) {
            let d = !1,
                e = !1;
            if ("function" == typeof bFreeGiftProduct) {
                var b = bFreeGiftProduct(a, !!$("body").hasClass("template-cart"), !0);
                if (!0 == b.foundMoreFreeGift && !0 == $("body").hasClass("template-cart")) return ShopifyAPI.getCart(cartUpdateCallback), !1;
                (a = b.cart), (d = !0);
            } else if ("function" == typeof bRulesDiscount) {
                var c = !1;
                if ("Subscription" == a.attributes["Product Type"]) var c = !0;
                var f = 0;
                $.each(a.items, function (b, a) {
                    f += a.original_price * a.quantity;
                }),
                    bRulesDiscount(f, c),
                    (e = !0);
            }
            let numberOfBralettesInCart = a.items.reduce((acc, lineItem) => {return lineItem.product_type.indexOf("Bralette") >= 0 ? lineItem.quantity == 1 ? acc += 1 : acc += lineItem.quantity : acc;}, 0);
            let freepanty = a.items.reduce((acc, lineItem) => {return !!lineItem.properties["tbop_freepanty"] ? acc = lineItem : acc;}, null);
            if (numberOfBralettesInCart < 2 && !!freepanty) {
                console.log(':: remove freepanty ::');
                let freepantyId = freepanty.id;
                jQuery.ajax({
                    type: 'POST',
                    url: '/cart/update.js',
                    async: false,
                    data: "updates["+ freepantyId +"]=0&attributes[has_tbop]=",
                    dataType: 'json',
                    success:function(data) {
                      console.log(':: free panty removed ::',{data: data});
                    }
                });
            }
            (isUpdating = !1),
                updateCountPrice(a),
                0 == a.item_count
                    ? ($(".cartIndicator").addClass("ebyMinicartEmptyCount").removeClass("ebyMinicartHasCount"),
                      $(".velaCartTop").addClass("empty").removeClass("avail"),
                      $(".ebyMicroBtn.joinNow").addClass("join").removeClass("buy"),
                      $(".header-minicart-wrapper").addClass("shop").removeClass("checkout"),
                      $(".header-checkoutbtn-wrapper").addClass("shop").removeClass("checkout"),
                      $(".motivator-bar").length > 0 && checkMotivatorBanner(0),
                      setTimeout(function () {
                          ShopifyAPI.getCart(buildCart, d, e);
                          vela.RightDrawer.close();
                      }, 150))
                    : setTimeout(function () {
                          ShopifyAPI.getCart(buildCart, d, e);
                      }, 150);
        }),
        (createQtySelectors = function () {
            $('input[type="number"]', $cartContainer).length &&
                $('input[type="number"]', $cartContainer).each(function () {
                    var a = $(this),
                        b = a.val(),
                        c = b + 1,
                        d = b - 1,
                        e = b,
                        f = $("#velaAjaxQty").html(),
                        g = Handlebars.compile(f),
                        h = { id: a.data("id"), itemQty: e, itemAdd: c, itemMinus: d };
                    a.after(g(h)).remove();
                });
        }),
        (qtySelectors = function () {
            var a = $('input[type="number"]');
            a.length &&
                (a.each(function () {
                    var a = $(this),
                        b = a.val(),
                        c = a.attr("name"),
                        d = a.attr("id"),
                        e = b + 1,
                        f = b - 1,
                        g = b,
                        h = $("#velaJsQty").html(),
                        i = Handlebars.compile(h),
                        j = { id: a.data("id"), itemQty: g, itemAdd: e, itemMinus: f, inputName: c, inputId: d };
                    a.after(i(j)).remove();
                }),
                $("body").on("click", ".velaQtyAdjust", function () {
                    var b = $(this),
                        c = (b.data("id"), b.siblings(".velaQtyNum")),
                        a = parseInt(c.val().replace(/\D/g, "")),
                        a = validateQty(a);
                    b.hasClass("velaQtyPlus") ? (a += 1) : (a -= 1) <= 1 && (a = 1), c.val(a);
                }));
        }),
        (validateQty = function (a) {
            return (parseFloat(a) != parseInt(a) || isNaN(a)) && (a = 1), a;
        }),
        //console.log('🥵 Finished Loading Ajaxcart 🤪'),
        (module = { init: init, load: loadCart, formOverride: formOverride, formOverrideLite: formOverrideLite })
    );
})(ajaxCart || {}, jQuery);
setTimeout(function () {
    ajaxCart.init({ formSelector: ".formAddToCart", cartContainer: "#cartContainer", addToCartSelector: ".btnAddToCart", cartCountSelector: "#CartCount", cartCostSelector: "#CartCost", moneyFormat: window.money });
});
