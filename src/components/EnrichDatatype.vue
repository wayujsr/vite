<template>
  <div>
    <b-row class="custom-model-select">
        <!-- <label>Custom Name: </label><input class="form-control" type="text" v-model="attrName" /></div> -->
      <!-- <div class="col-12 mb-4" style="font-weight:bold; word-break: break-word;">{{el[type + "_modalAttribute"]}}{{el[type + "_schemaValue"]}}</div> -->
      <input style="display:none" v-model="refreshDOM" />
      <b-form-group class="col-12 mb-3">
        <b-form-radio-group v-model="el[type+'_attr_type']">
          <b-form-radio v-if="el.params_index === 2 ? false :true" :value="type+'_space'" @change="attributeType(type,$event)">Space Attribute</b-form-radio>
          <b-form-radio v-if="el.params_index === 2 ? false :true" :value="type+'_rule'" @change="attributeType(type,$event)">Rule Attribute</b-form-radio>
          <b-form-radio v-if="el.params_index === 1 ? false :true && commonType" :value="type+'_text'" @change="attributeType(type,$event)">Text</b-form-radio>
          <b-form-radio v-if="el.params_index === 1 ? false :true && commonType && (el.id === 'array_attribute_params' || el.id === 'array_attribute_rhs' || $store.state.isArrayFilterActive)" :value="type+'_array_filter'" @change="attributeType(type,$event)">Array Filter</b-form-radio>
          <b-form-radio v-if="commonType && el.id === 'custom_function_params'" :value="type+'_is_dynamic'" @change="attributeType(type,$event)">Is Dynamic</b-form-radio>
        </b-form-radio-group>
      </b-form-group>
      <!-- {{el[type+'_attr_type'] +"  "+ type}} -->
      <div :class="el[type+'_schemaOptions'] || !commonType ? 'col-9 no-padding left' : 'col-12 no-padding left'" v-if="el[type+'_attr_type'] === type+'_space'">
        <b-col sm="3" class="col">
          <div class="">Classification: </div>
          <model-select
            :options="classificationList"
            v-model="el[type+'_selectedClassification']"
            @input="selectClassification"
            placeholder="Select Attribute"
          ></model-select>
        </b-col>
        <b-col sm="4" class="col">
          <div class="">Space: </div>
          <model-select
            :options="spaceList"
            v-model="el[type+'_selectedSpace']"
            @input="selectSpace"
            placeholder="Select Attribute"
          ></model-select>
        </b-col>
        <b-col sm="5" class="col">
          <div class="">Attribute: </div>
          <model-select
            :options="attributesList"
            v-model="el[type+'_selectedAttribute']"
            @input="selectAttribute(el[type+'_selectedAttribute'],'attr')"
            :class="el[type+'_selectedAttribute'] ? '' : 'is-invalid'"
            placeholder="Select Attribute"
          ></model-select>
          {{el[type+"_sample_value"]}}
        </b-col>
      </div>
      <template v-else-if="el[type+'_attr_type'] === type+'_rule'">
        <b-col sm="4" class="col">
          <div class="">Rule: </div>
          <model-list-select
              :list="ruleList"
              option-value="value"
              option-text="text"
              v-model="el[type+'_selectedRule']"
              placeholder="Select Attribute"
              @searchchange="getRuleList"
              @input="selectRule"
          ></model-list-select>
        </b-col>
        <b-col sm="3" class="col">
          <div class="">Alias: </div>
          <select :class="{'form-control':true, 'is-invalid':!el[type+'_selectedAlias']}" v-model="el[type+'_selectedAlias']" @change="selectAttribute(el[type+'_selectedAlias'],'cus-func')" placeholder="Select Custom Function">
            <option v-for="(item,i) in aliasList" :key="i" :value="item.value">{{item.text}}</option>
          </select>
          {{el[type+"_sample_value"]}}
        </b-col>
      </template>
      <template v-else-if="el[type+'_attr_type'] === type+'_text'">
        {{computeShape}}
        <datetime v-if="el.name === 'date_diff' || el.datatype === 'timestamp' && (el.symbol !== 'lt' && el.symbol !== 'gt' && el.symbol !== 'eq')" type="datetime" :class="el[type+'_modalAttribute'] ? '' : 'is-invalid'" v-model="el[type+'_modalAttribute']" ></datetime>
        <textarea v-else @change="inputValue($event)" :class="el[type+'_modalAttribute'] ? '' : 'is-invalid'" v-model="el[type+'_modalAttribute']" class="form-control"></textarea>
      </template>
      <div v-else-if="el[type+'_attr_type'] === type+'_array_filter'"
        class="col-12 no-padding left">
        {{computeShape}}
        <b-col sm="3" class="col">
          <div v-if="el['array_filter_attribute']">
            {{el['array_filter_attribute'].replace(".","")}} 
          </div>
          <treeselect v-else
          v-model="el[type+'_schema']"
          :multiple="false"
          :searchable="true"
          @select="selectTree($event,'array',type, el.id)"
          @input="selectTree"
          :options="el[type+'_'+el.id+'_schemaOptions']"
          :normalizer="normalizer"
          value-consists-of="ALL_WITH_INDETERMINATE"
          placeholder="Select attribute..."/>
        </b-col>
        <b-col sm="1" class="col" v-if="el.id === 'array_attribute_params' && parentTasks.name !== 'date_diff'">
          <select class="form-control" v-model="el.selectedOperator" @change="selectOperator($event,el)">
              <option v-for="(item,k) in arrayFilterOperatorList" :key="k" :value="item.id">{{item.name}}</option>
            </select>
        </b-col>
        <b-col sm="8" class="col" v-if="el.id === 'array_attribute_params' && parentTasks.name !== 'date_diff'">
          <Enrich
            :pageType="pageType"
            :ruleAttrObj="ruleAttrObj" :dataList="dataList"
            :commonType="true" :parentTaskIndex="parentTaskIndex" :parentTasks="parentTasks" :el="el.rhs[0]" :depth="depth" @refreshBuilder="refreshBuilder" @resetRuleBuilder="resetRuleBuilder" type="right"></Enrich>
        </b-col>
      </div>
      <b-col :sm="el[type+'_attr_type'] === type+'_rule' ? '5' : '3'" class="no-padding right" v-if="el[type+'_schemaOptions']">
        <div class="">Expression: </div>
        <treeselect
          v-model="el[type+'_schema']"
          :multiple="false"
          :searchable="true"
          @select="selectTree($event,commonType && (el.id === 'array_attribute_params' || el.id === 'array_attribute_rhs'))"
          @input="selectTree"
          :options="el[type+'_schemaOptions']"
          :normalizer="normalizer"
          value-consists-of="ALL_WITH_INDETERMINATE"
          placeholder="Select attribute..."/>
      </b-col>
    </b-row>
  </div>
</template>
<script>
import { getRuleAttribteSchemaDetails } from './RuleAttributeShcema.js';
// import Treeselect from '@riophae/vue-treeselect'
import { ModelSelect, ModelListSelect } from "vue-search-select";
// import '@riophae/vue-treeselect/dist/vue-treeselect.css'
// import { Datetime } from 'vue-datetime';
export default {
  name: "Enrich",
  props: {
    ruleAttrObj: Object,
    el: Object,
    type: String,
    pageType: String,
    depth: Number,
    parentTasks: Array,
    dataList: Object,
    parentTaskIndex: Number,
    commonType: Boolean
  },
  components:{
    // Treeselect,
    ModelSelect,
    ModelListSelect,
    // Datetime
  },
  data: function() {
    return {
      urls: this.$store.state.urls,
      isSuperUser: false,
      putRequest: {
        status: false,
        id: ""
      },
      functionalType: "control",
      toggle: true,
      dynamicAttributesList:[],
      attrName: "",
      aliasList: [],
      schema: "",
      // schemaOptions: null,
      modalAttribute: "",
      refreshDOM: true,
      schemaValue: "",
      classificationList: [],
      controlList: [],
      // spaceList: [],
      selectedRule: "",
      selectedAttribute: "",
      left_attr_type: "left_text",
      left_modalAttribute: "",
      selectedAlias: "",
      left_textValue: "",
      right_textValue: "",
      selectedControl: {},
      attrSchema: {},
      selectedSpace: {},
      selectedClassification: "",
      controlAttrMapping: {},
      attrMapping: {},
      ruleList: [],
      arrayFilterOperatorList: [],
      ruleAliasMapping: {},
      ruleShapeMapping: {},
      normalizer(node) {
        return {
          id: node.uid,
          label: node.name,
          children: node.fields && node.fields.length ? node.fields : "",
        }
      },
    };
  },
  created:async function() {
    this.isSuperUser = this.$getCookie("super-user") === "true" ? true : false;
    this.putRequest = {
      status: true,
      id: this.$route.params.id
    };
    this.classificationList = this.ruleAttrObj.classificationList;
    this.controlList = this.ruleAttrObj.controlList;
    this.controlAttrMapping = this.ruleAttrObj.controlAttrMapping;
    this.attrMapping = this.ruleAttrObj.attrMapping;
    this.attrSchema = {};
    this.$runScehma(this.el[this.type + '_schemaOptions'],"");
    if(this.el.id  === "array_attribute_params"){
      this.$runScehma(this.el[this.type + '_array_filter_schemaOptions'],"");
    }
    if(this.el.id  === "array_attribute_rhs"){
      this.$runScehma(this.el['right_array_filter_rhs_schemaOptions'],"");
    }

    if(this.el.left_enrich_type === "rule" || this.el.right_attr_type ===  "right_rule"){
      this.getAliasList();
    }
  },
  computed:{
    arrayFilterFirstParamFlag(){
      return this.el.id === "array_attribute_params" && this.el.params_index === 1
    },
    computeShape(){
      // console.log(this.type, 'computing',this.el, this.el && this.el.datatype)
      // console.log(this.type,this.el)
      if(this.el && this.el.datatype){
        // console.log(this.el.datatype, "210 compute  shape", this.parentTasks)
        try{
          this.getOperatorList(this.dataList.datatypeMapping[this.el.datatype].allowed_operators)
        }catch (e){

        }
      }
      // console.log(this.$store.state.arrayFilterSchema, this.el.id);
      if(this.type === "left"){
        this.el[this.type+"_"+this.el.id+"_schemaOptions"] = this.$store.state.arrayFilterSchema;
      } else if(this.type === "right"){
        this.el[this.type+"_"+this.el.id+"_schemaOptions"] = this.$store.state.arrayFilterSchema;
      }
    },
    spaceList(){
      let one = this.refreshDOM;
      if(this.el[this.type+"_selectedClassification"]){
        return this.controlList[this.el[this.type+"_selectedClassification"]];
      }else{
        return []
      }
    },
    attributesList(){
      let one = this.refreshDOM;
      if(this.el[this.type+'_selectedSpace']){
        return this.controlAttrMapping[this.el[this.type+'_selectedSpace']]
      } else{
        return  []
      }
    },
  },
  methods: {
    getRuleList: async function(searchText){
      if(searchText === ""){
        return
      }
      this.ruleList = [];
      this.searchText = searchText;
      clearTimeout(this.timeoutId);
      this.timeoutId = setTimeout(async () => {
        // Your API call logic here
        let list = await this.$getCall(this.urls.ruleCfRegexListApi + searchText + "&rule_type=" + this.pageType)
        if(Object.keys(list).length > 0){
          for(let key in list){
            this.ruleList.push({text:key, value:list[key][0], details:list[key]});
          }
        }
      }, 300);
    },
    selectOperator(e,el,i){
      let operator = this.dataList.operatorMapping[e.target.value];
      // console.log(operator)
      if(operator){
        this.el.symbol = operator.symbol;
        this.el.viz = operator.category;
        // this.el.datatype = operator.datatype;
      }else {
        this.el.symbol = "";
      }
      this.refreshDOM = !this.refreshDOM;
      // this.$emit("refreshBuilder");
      this.resetRuleBuilder();
    },
    inputValue(e){
      this.resetRuleBuilder();
      this.refreshDOM = !this.refreshDOM;
    },
    refreshBuilder(){
      this.$emit("refreshBuilder");
    },
    attributeType(type,e){
      // console.log(type, this.el)
      if(this.arrayFilterFirstParamFlag){
        // console.log("schema changed for params 1 under array filter");
        this.$store.dispatch('isValidArrayFilterSchema', false)
      }
      if(e === "left_text" || e === "right_text"){
        this.el[type+"_modalAttribute"] = "";
        this.el[type+"_enrich_type"] = "text";
      }else{
        this.el[type+"_enrich_type"] = "";
      }
      // this.el[this.type +"_selectedClassification"] = "";
      // this.el[this.type +"_selectedRule"] = "";
      this.el[this.type+"_selectedAlias"] = "";
      // this.el[this.type +"_selectedSpace"] = "";
      this.el[this.type +"_schemaValue"] = "";
      this.el[this.type+"_schema"] = ""
      this.el[this.type+'_schemaOptions'] = null;
      this.el[this.type + "_selectedAttribute"] = "";
      this.el[this.type + "_modalAttribute"] = "";
      this.el[this.type + "_sample_value"] = "";
      if(e === "left_is_dynamic"){
        this.el[type+'_modalAttribute'] = this.el.paramName;
      }
      this.refreshDOM = !this.refreshDOM;
      this.$emit("refreshBuilder");
    },
    resetRuleBuilder(){
      if(this.parentTasks){
        this.parentTasks.push("")
        this.parentTasks.pop("")
      }
      this.refreshDOM = !this.refreshDOM;
      this.$emit("refreshBuilder");
    },
    getOperatorList(operators){
      try{
        this.arrayFilterOperatorList = operators.map(item => {
          return {
            id: item,
            name: this.dataList.operatorMapping[item].name
          }
        })
        this.arrayFilterOperatorList.unshift({id:"",name:"None"});
      }catch(e){
        this.arrayFilterOperatorList.unshift({id:"",name:"None"});
      }
    },
    selectTree(data,type,prefix1,prefix2){
      // console.log(data,type,prefix1,prefix2,this.el, this.type);
      // type is used for array_filter
      if(data === undefined){
        window.setTimeout(e => {
          if(this.el.id === 'array_attribute_params' && this.el.params_index === 1){
            this.fillSchemaStruct(this.el.left_schemaOptions);  //  reset to  by  default shema
          }
          this.el[this.type + "_schemaValue"] = "";
          this.el[this.type + "_default_sample_value"] = "";
          this.el[this.type + "_is_timestamp"] = false;
          this.el[this.type + "_dateOutput"] = "";
          this.resetRuleBuilder();
        },50);
      }
      // let validateData = (type, schema, data, prefix2, sample_value, typeFlag) => {
      //   console.log(type, schema, data, prefix2, sample_value, typeFlag);
      //   this.el[type + "_schemaValue"] = "";
      //   this.el[type + "_default_sample_value"] = "";
      //   this.el[type + "_is_timestamp"] = false;
      //   if(this.attrSchema && this.attrSchema[this.el[schema]]){
      //     this.el[prefix1 + "_schemaValue"] = this.attrSchema[this.el[schema]].parent + this.attrSchema[this.el[schema]].label;
      //     if(data && data.sample_value){
      //       this.el[sample_value + "_sample_value"] = this.$filteredSampleValue(data.sample_value);
      //     }
      //     if(typeFlag === "array"){
      //       this.$store.dispatch('isValidArrayFilterSchema',true);
      //     }
      //   }
      //   if(data && data.is_timestamp){
      //     this.el[this.type + "_is_timestamp"] = data.is_timestamp;
      //     this.el[this.type + "_dateOutput"] = data.timestamp_format;
      //   }
      //   if(this.el.id === "date_diff_id" && data && !data.is_timestamp){
      //     this.el[this.type + "_schemaValue"] = "";
      //     this.el[this.type + "_schema"] = null;
      //     this.selectTree();
      //     alert("Timestamp attribute is required");
      //   }
      // };
      // console.log(type, data)
      if(typeof(data) === "object"){
        window.setTimeout(e => {
          if(type === "array"){
            if(data && data.datatype && this.dataList){
              this.el.datatype = data.datatype;
              this.getOperatorList(this.dataList.datatypeMapping[data.datatype].allowed_operators)
            }
            this.attrSchema = {}
            this.$runScehma(this.el[prefix1 + "_" + prefix2 + "_schemaOptions"],"");
            let schema = prefix1 + "_schema";
            // validateData(prefix1,schema, data, prefix2, prefix1 + "_"+ prefix2, "array")
            this.el[prefix1 + "_schemaValue"] = "";
            this.el[prefix1 + "_default_sample_value"] = "";
            this.el[prefix1 + "_is_timestamp"] = false;
            if(this.attrSchema && this.attrSchema[this.el[schema]]){
              this.el[prefix1 + "_schemaValue"] = this.attrSchema[this.el[schema]].parent + this.attrSchema[this.el[schema]].label;
              if(data && data.sample_value){
                this.el[prefix1 + "_"+ prefix2 + "_sample_value"] = this.$filteredSampleValue(data.sample_value);
              }
              this.$store.dispatch('isValidArrayFilterSchema',true);
            }
            if(data && data.is_timestamp){
              this.el[this.type + "_is_timestamp"] = data.is_timestamp;
              this.el[this.type + "_dateOutput"] = data.timestamp_format;
            }
            if(this.el.id === "date_diff_id" && data && !data.is_timestamp){
              this.el[this.type + "_schemaValue"] = "";
              this.el[this.type + "_schema"] = null;
              this.selectTree();
              alert("Timestamp attribute is required");
            }
          }else{
            if(type === true && data?.datatype === "array"){
              this.$store.commit("isArrayFilterValid",true)
              if(data?.fields[0].fields?.length){
                // this.$store.dispatch('arrayFilterSchema', data.fields[0].fields);
                this.fillSchemaStruct(data.fields[0].fields,data);
              }else{
                this.$store.dispatch('arrayFilterSchema', data.fields[0].fields);
                this.fillSchemaStruct(data.fields[0].fields,data);
              }
            } else if(this.arrayFilterFirstParamFlag) {
              this.$store.commit("isArrayFilterValid",false);
              this.$store.dispatch('arrayFilterSchema', []);
              this.fillSchemaStruct([]);
              alert("Wrong expression, please check");
            }
            // console.log("normal date diff",this.type)
            let schema = this.type + "_schema";
            // validateData(this.type, schema, data, "_schemaValue", this.type, "simple")
            this.el[this.type + "_schemaValue"] = "";
            this.el[this.type + "_default_sample_value"] = "";
            if(this.attrSchema && this.attrSchema[this.el[schema]]){
              this.el[this.type + "_schemaValue"] = this.attrSchema[this.el[schema]].parent + this.attrSchema[this.el[schema]].label;
              if(data && data.sample_value){
                this.el[this.type+"_sample_value"] = this.$filteredSampleValue(data.sample_value);
              }
              if(data && data.is_timestamp){
                this.el[this.type + "_is_timestamp"] = data.is_timestamp;
                this.el[this.type + "_dateOutput"] = data.timestamp_format;
              }
              if(this.el.id === "date_diff_id" && data && !data.is_timestamp){
                this.el[this.type + "_schemaValue"] = "";
                this.el[this.type + "_schema"] = null;
                this.selectTree();
                alert("Timestamp attribute is required");
              }
            }
          }
          // this is to update rulebuild UI explicitily 
          this.$emit("refreshBuilder");
          this.resetRuleBuilder();
        },50)
      }
    },
    selectRule:async function(item){
      // console.log(this.type,item)
      this.el[this.type + "_schemaValue"] = "";
      this.el[this.type + "_schema"] = ""
      this.el[this.type + '_schemaOptions'] = null;
      this.el[this.type + "_sample_value"] = "";
      this.el[this.type + "_selectedAlias"] = "";
      this.el[this.type + "_modalAttribute"] = "";
      this.el[this.type + "_selectedRuleName"] = "";
      this.resetRuleBuilder();
      this.getAliasList();
    },
    getAliasList:async function(){
      this.aliasList = [];
      if(this.el[this.type+'_selectedRule']){
        let rule = this.el[this.type+'_selectedRule'];
        await this.$getCall(this.urls.ruleCfRegexDetailApi + rule + "&rule_type=" + this.pageType).then(async (res) => {
          this.ruleList = [{text: res[0]?.rule_name, value: res[0]?.rule_id}]
          this.el[this.type + "_selectedRuleName"] = res[0]?.rule_name;
          await getRuleAttribteSchemaDetails(res).then(response => {
            let [cfRuleList, cfRuleShapeMapping, cfRuleAliasMapping] = [...response]
            this.aliasList = cfRuleAliasMapping[rule] && cfRuleAliasMapping[rule].alias_list ? cfRuleAliasMapping[rule].alias_list : [];
            this.cfRuleShapeMapping = cfRuleShapeMapping;
            this.cfRuleAliasMapping = cfRuleAliasMapping;
          });
        });
        // this.aliasList = list;
      } else{
        this.aliasList = []
      }
    },
    selectAttribute(item,type){
      // console.log(item,type);
      // console.log(this.attrMapping);
      // console.log(this.attrMapping[item]);
      this.el[this.type + "_schemaValue"] = "";
      this.el[this.type + "_schema"] = ""
      this.el[this.type + '_schemaOptions'] = null;
      this.el[this.type + "_sample_value"] = "";
      if(type === 'cus-func'){
        let val = this.cfRuleAliasMapping[this.el[this.type + "_selectedRule"]] && this.cfRuleAliasMapping[this.el[this.type + "_selectedRule"]].name
        item = val+"."+ this.el[this.type + "_selectedAlias"];
      }
      let data = type === "attr" ? this.attrMapping[item] : this.cfRuleShapeMapping[item];
      // console.log(data)
      // console.log(this.el.name = "array item");
      // if selected attribute is array type then data doesn't have datatype key
      if(this.el.name === "array item" && data.datatype !== "array"){
        this.$store.commit("isArrayFilterValid", false)
      }else{
        this.$store.commit("isArrayFilterValid", true)
      }
      // console.log(this.$store.state.isArrayFilterValid);
      if(data){
        this.el[this.type+"_enrich_type"] = data.type;
        if(type !== "attr"){
          this.el[this.type+"_enrich_type"] = "rule";
          data.fields = data.attribute && data.attribute.fields ? data.attribute.fields: null;
          if(data && data.attribute && data.attribute.is_timestamp){
            this.el[this.type+"_is_timestamp"] = data.attribute.is_timestamp;
            this.el[this.type+"_dateOutput"] = data.attribute.timestamp_format;
          }else{
            this.el[this.type+"_is_timestamp"] = false;
            this.el[this.type+"_dateOutput"] = "";
          }
        }else{
          if(data && data.sample_value){
            this.el[this.type+"_sample_value"] = this.$filteredSampleValue(data.sample_value);
          }
          if(data && data.is_timestamp){
            this.el[this.type+"_is_timestamp"] = data.is_timestamp;
            this.el[this.type+"_dateOutput"] = data.timestamp_format;
          }else{
            this.el[this.type+"_is_timestamp"] = false;
            this.el[this.type+"_dateOutput"] = "";
          }
        }
        if(data.fields && data.fields.length){
          this.attrSchema = {}
          this.$runScehma(data.fields,"");
          this.el[this.type +'_schemaOptions'] = data.fields
          if(this.arrayFilterFirstParamFlag){
            // console.log("Valid array filter schema to true");
            // console.log(data);
            this.$store.dispatch('isValidArrayFilterSchema', true)
            if(data.datatype === "array"){
              this.fillSchemaStruct(data?.fields[0]?.fields ?? []);
            }else{
              this.fillSchemaStruct(data?.fields ?? []);
            }
          }
        }
        if(data.target_expression) {
          this.el[this.type + "_modalAttribute"] = data.target_expression.replace(/{{attribute}}/g,"${attribute-"+data.name+"}");
        }else {
          if(type === "attr"){
            this.el[this.type + "_modalAttribute"] = "#getFeatureAttribute(${attribute-"+ data.name +"})"
          } else {
            this.el[this.type + "_modalAttribute"] = "${rule_variables."+ item +"}"
          }
        }
      } else {
        this.el[this.type +'_schemaOptions'] = null;
        this.el[this.type + "_modalAttribute"] = type === "attr" ? "" : "${rule_variables."+ item +"}";
      }
      this.resetRuleBuilder();
    },
    fillSchemaStruct(data, rawData){
      // console.log(data,rawData)
      // console.log(this.parentTasks[0].left_schemaValue)

      // note this is to refresh array filter predicate block
      this.$store.dispatch('arrayFilterSchema', data ?? []);
      this.parentTasks[1][this.type +'_'+this.el.id+'_schemaOptions'] = data ?? [];
      this.parentTasks[1].rhs = [];
      this.parentTasks[1].tasks = [];
      this.parentTasks[1].left_schemaValue = "";
      this.parentTasks[1]["array_filter_attribute"] = data?.length ? "": rawData?.name;
      this.parentTasks[1].left_schema = "";
      this.parentTasks[1].rhs.push({'id':'array_attribute_rhs', 'left_attr_type':'left_text', 'type':'right'});
      this.parentTasks[1].rhs[0]['right_array_attribute_rhs_schemaOptions'] = data?.fields ?? [];
    },
    selectClassification(item){
      this.resetFields();
    },
    selectSpace(item){
      this.resetFields();
    },
    resetFields(){
      this.refreshDOM = !this.refreshDOM;
      this.el[this.type + "_schemaValue"] = "";
      this.el[this.type + "_schema"] = "";
      this.el[this.type + "_selectedAttribute"] = "";
      this.el[this.type + "_modalAttribute"] = "";
      this.el[this.type + "_sample_value"] = "";
      this.resetRuleBuilder();
    }
  }
};
</script>
