const EVENTS = "Events";

let controlAttrMapping = {};
let counter = 0;

export const jsGetControlList = function (
    arr,
    routeName,
    dslJourneyEntryEvent
) {
    console.log(arr);
    let data;
    data = arr.map((raw, i) => {
        if (raw.spaces && raw.spaces.length) {
            raw.spaces = raw.spaces.map((item) => {
                let value = jsUIKeyList(item, routeName, dslJourneyEntryEvent);
                return value;
            });
            return raw;
        } else {
            let value = jsUIKeyList(raw, routeName, dslJourneyEntryEvent);
            return value;
        }
    });
    console.log([data, controlAttrMapping])
    return [data, controlAttrMapping];
};

const jsUIKeyList = function (item, routeName, dslJourneyEntryEvent) {
    let id = item?.id ? item.id : counter++;
    item.tasks = [];
    item.show = false;
    item.id = id;
    item.selected_context = "";
    item.abSplitValue = [];
    item.symbol = "";
    item.dateDiff = "day";
    item.custom_function = item?.custom_function ? item.custom_function : "";
    item.dateParamOneDate = "";
    item.dateParamTwoDate = "";
    item.left_attr_type = "left_text";
    item.right_attr_type = "right_text";
    item.isCustomParamOne = true;
    item.isCustomParamTwo = true;
    item.dateDiffParamOne = "";
    item.dateDiffParamTwo = "";
    item.queryBuilder = { expression: [], preview: "" };
    item.value = item?.value?.length ? item.value : [];
    item.exp = [0];
    item.refr = [0];
    item.reference_expression = "";
    item.cfParams = item?.cfParams ? item.cfParams : [];
    item.output_expression = "";
    item.joiner = "or";
    item.sample_value = item?.sample_value;
    item.alias = "";
    item.isNot = false;
    item.datatype = "";
    item.viz = "";
    item.dateOutput = "";
    item.selectedOperator = "";
    item.selectedCFRule = "";
    item.concatInfo = [],
    item.selectedCFRuleAlias = "";
    item.selectedCFRuleShape = "";
    item.selectedCFRuleFields = [];
    item.selectedCFRuleExpression = "";
    let attributes = [];
    if (item?.attributes?.length) {
        item.attributes.forEach((itemj, j) => {
            // console.log(itemj)
            let value = itemj?.attribute;
            let data = {};
            data.name = value?.name ? value.name : itemj.name;
            data.fields = itemj?.fields;
            data.id = value?.id ? value.id : itemj?.id;
            data.is_timestamp = itemj?.is_timestamp;
            data.sample_value = itemj?.sample_value;
            data.timestamp_format = itemj?.timestamp_format;
            data.is_custom_wrapperd =
                itemj?.type === "custom_wrapped_attribute" ? true : false;
            data.target_output_attribute = itemj?.target_output_attribute
                ? itemj.target_output_attribute
                : "";
            data.datatype =
                value?.datatype
                    ? value.datatype.toLowerCase()
                    : itemj?.datatype;
            data.target_expression = itemj?.target_expression;
            if (
                routeName === "DSL Journey" &&
                dslJourneyEntryEvent &&
                item?.name === EVENTS
            ) {
                if (
                    itemj?.name &&
                    itemj?.name.includes("." + dslJourneyEntryEvent + ".")
                ) {
                    attributes.push(data);
                }
            } else {
                attributes.push(data);
            }
        });
    }
    delete item.attributes;
    controlAttrMapping[item.name] = attributes;
    controlAttrMapping[id] = item.name;
    return item;
};


export const getControlAttribute = function (data) {
    let control = [];
    let controlMapping = {}, attrMapping={}, spaceMapping={}, classificationList=[];
    let index = 0;
    for(let item of data){
        if(item.spaces.length){
            control = item.spaces.map(itemj => {
                let arr = itemj?.attributes?.filter(itemk => {
                    itemk.text = itemk.name;
                    itemk.value = itemk.id;
                    itemk.type = itemk.type;
                    itemk.attr_id = itemk.id;
                    if(itemk.target_output_attribute){
                        itemk.fields = itemk.target_output_attribute.fields
                    }
                    attrMapping = {...attrMapping, [itemk.id]:itemk}
                    if(this.$route?.meta?.redirectLabel === "DSL Journey" && this.$store.state?.dslJourneyEntryEvent && itemj?.name === EVENTS){
                        if(itemk?.name && itemk?.name.includes("."+this.$store.state?.dslJourneyEntryEvent+".")){
                          return itemk
                        }
                      }else{
                        return itemk
                      }
                });
                controlMapping[itemj.name] = arr;
                controlMapping[itemj.id] = arr;
                return {text:itemj.name, value:itemj.id}
            });
            spaceMapping = {...spaceMapping, [item.name]:control}
            classificationList.push({text:"",value:""})
            classificationList[index] = {text:item.name, value:item.name};
            index++;
        }
    }
    let [ruleList, cfMapping, ruleMapping] = [[],{},[]];
    return [classificationList,spaceMapping, controlMapping, attrMapping, ruleList, cfMapping, ruleMapping];
}