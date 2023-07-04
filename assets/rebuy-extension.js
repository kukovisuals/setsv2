const getCartItemsAttributeMap = (optionNames = []) => {
    const map = {};
    const items = Rebuy.Cart.items();

    if (items.length) {
        
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
    
            for (let x = 0; x < item.options_with_values.length; x++) {
                const option = item.options_with_values[x];

                if (optionNames.length == 0 || optionNames.includes(option.name)) {
                    if (typeof map[option.name] == 'undefined') {
                        map[option.name] = [];
                    }
    
                    if (!map[option.name].includes(option.value)) {
                        map[option.name].push(option.value);
                    }
                }
                
            }
            
        }

    }

    return (!!Object.keys(map).length) ? map : null;
}

const autoSelectVariantsByAttributeMap = (products, map) => {
    if (products && map) {

        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            const productMap = {
                option1: null,
                option2: null,
                option3: null
            };

            for (let x = 0; x < product.options.length; x++) {
                const option = product.options[x];

                if (option.name in map) {
                    const optionKey = `option${x+1}`;
                    productMap[optionKey] = option.values.filter(value => map[option.name].includes(value));
                }
            }

            if (!!Object.keys(productMap).length) {
                let selectedVariant = product.variants[0];
                let selectedVariantRank = 0;

                for (let x = 0; x < product.variants.length; x++) {
                    const variant = product.variants[x];
                    let variantRank = 0;
                    
                    for (let o = 1; o <= 3; o++) {
                        const optionKey = `option${o}`;
                        if (variant[optionKey] == null && productMap[optionKey] == null || Array.isArray(productMap[optionKey]) && productMap[optionKey].includes(variant[optionKey])) {
                            variantRank++;
                        }
                    }

                    if (variantRank > selectedVariantRank) {
                        selectedVariant = variant;
                        selectedVariantRank = variantRank;
                    }
                }

                // Select the best matching variant
                product.selected_variant_id = selectedVariant.id;
                product.selected_variant = selectedVariant;
                product.option1 = selectedVariant.option1;
                product.option2 = selectedVariant.option2;
                product.option3 = selectedVariant.option3;
        
            }
            
        }
    }
}

document.addEventListener('rebuy:cart.change', function(event){
    for (let i = 0; i < Rebuy.widgets.length; i++) {
        autoSelectVariantsByAttributeMap(Rebuy.widgets[i].data.products, getCartItemsAttributeMap());
    }
});

document.addEventListener('rebuy.productsChange', function(event){
    autoSelectVariantsByAttributeMap(event.detail.products, getCartItemsAttributeMap());
});