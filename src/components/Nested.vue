<template>
    <div class="drag-container">
      <div style="background:#ffffff; display:none;">{{expression}}</div>
      <draggable :class="{dragArea:true, first: first }"  tag="ul" :list="tasks" group="people" @change="log" :disabled="is_drag_disabled">
        <li v-for="(el,i) in tasks" :key="i" :id="'li-'+depth+'-'+i">
          <span class="toggle-block" v-if="(i !== 0 || !first) && !isCustomFunction && el.name !== 'operators' && !['rest_api','rest_api_attribute'].includes(el.type)">
            <span class="inner">
              <input type="radio" @change="joiner(el,i,$event)" v-model="el.joiner" value="and" :name="'opt'+i+depth" :id="'and'+i+depth" />  <label :for="'and'+i+depth"> AND</label>
              <input type="radio" @change="joiner(el,i,$event)" v-model="el.joiner" value="or" :name="'opt'+i+depth" :id="'or'+i+depth" />  <label :for="'or'+i+depth"> OR</label>
              <input type="radio" @change="joiner(el,i,$event)" v-model="el.joiner" value="" :name="'opt'+i+depth" :id="'none'+i+depth" /> <label :for="'none'+i+depth"> NONE</label>
            </span>
          </span>
          <div v-if="el.name === 'rule_attributes'" class="row">
            <div class="col-11">
              {{el.name}}
              <ArrowNavRb
                :index="i"
                :length="tasks.length"
                :depth="depth"
                @leftClick="leftClick" @rightClick="rightClick" @upClick="upClick" @downClick="downClick">
              </ArrowNavRb>
            </div>
            <div class="col-2">
              <div class="">Rule: </div>
              <span :class="{'not-sign':true,'active':el.isNot}" @click="isNotCheck(el.isNot, i)">!</span>
              <model-list-select
                :list="el.ruleCFList ? el.ruleCFList : ruleCFList"
                option-value="value"
                option-text="text"
                v-model="el.selectedCFRule"
                placeholder="Select Attribute"
                @searchchange="getRuleList($event,i)"
                @input="selectCFRule(el.selectedCFRule,i)"
              ></model-list-select>
            </div>
            <div class="col-1">
              <div class="">Variable: </div>
              <select class="form-control pl-2 pr-1" v-model="el.selectedCFRuleAlias" @change="selectRuleAlias(el.selectedCFRuleAlias,i)">
                <option v-for="(item,k) in el.aliasList ? el.aliasList : aliasList" :key="k"  :value="item.value">{{item.text}}</option>
              </select>
              <!-- {{el.sample_value}} -->
            </div>
            <div class="col-2" v-if="el.selectedCFRuleFields">
              <div class="">Attribute: </div>
              <!-- @select="selectTree(el,i)" -->
              <treeselect
                v-model="el.selectedCFRuleShape"
                :multiple="false"
                :searchable="true"
                @select="selectTree(el,i,'rule_attributes',$event)"
                @input="selectTree(el,i,'rule_attributes','clear')"
                :options="el.selectedCFRuleFields"
                :normalizer="normalizer"
                value-consists-of="ALL_WITH_INDETERMINATE"
                placeholder="Select attribute..."/>
                {{el.sample_value}}
            </div>
            <div class="col-1">
              <div class=""> &nbsp; </div>
              <select class="form-control" v-if="operatorsList" v-model="el.selectedOperator" @change="selectOperator($event,el,i)">
                <option v-for="(item,k) in computedList(i)" :key="k" :value="item.id">{{item.name}}</option>
              </select>
            </div>
            <div :class="el.selectedCFRuleFields && el.selectedCFRuleFields.length ? 'col-5' : 'col-7'">
              <i class="fa fa-close red float-right" @click="deleteEl(i)"></i>
              <div class=""> &nbsp; </div>
              <template v-if="el.viz === 'BINARY'">
                <!-- <input :class="{'form-control':true, 'is-invalid':checkQuotes(el.value[0])}" :type="inputType(el.datatype)" v-model="el.value[0]" /> -->
                <Enrich :pageType="pageType" :ruleAttrObj="ruleAttrObj" :commonType="true" :el="el" :depth="depth" type="left" :operatorList="computedList(i)" @refreshBuilder="refreshBuilder"></Enrich>
              </template>
              <template v-else-if="el.viz === 'NARY'">
                <div v-for="(item,l) in el.value" :key="l" class="listing-lhs">
                  <input :class="{'form-control':true, 'is-invalid':checkQuotes(el.value[l])}" :type="inputType(el.datatype)" v-model="el.value[l]"/>
                  <span class="del-link" @click="el.value.splice(l,1)">Remove</span>
                </div>
                <span class="link" @click="el.value.push('')">Add</span>
              </template>
              <template v-else-if="el.viz === 'UNARY'">
              </template>
              <template v-else-if="el.viz === 'TERNARY'">
                <label class="row">
                  <div class="col-6">
                    <input class="form-control" :type="inputType(el.datatype)" :value="el.value[0]" @blur="fillInput($event,i)" />
                  </div>
                  <div class="col-6">
                    <input class="form-control" :type="inputType(el.datatype)" :value="el.value[1]" @blur="fillInput($event,i)" />
                  </div>
                </label>
              </template>
            </div>
            <div class="col-1" v-if="el.symbol === 'lt' || el.symbol === 'gt' || el.symbol === 'eq'">
              <div>&nbsp;</div>
              <select class="form-control" v-model="el.dateDiff">
                <option v-for="(item,k) in dateDiffList" :key="k" :value="item.value">{{item.text}}</option>
              </select>
            </div>
          </div>
          <div v-else-if="el.name === 'date_diff'" class="row">
            <div class="col-12">
              {{el.name}}
              <ArrowNavRb
                :index="i"
                :length="tasks.length"
                :depth="depth"
                @leftClick="leftClick" @rightClick="rightClick" @upClick="upClick" @downClick="downClick">
              </ArrowNavRb>
            </div>
            <div class="col-3">
              <span :class="{'not-sign':true,'active':el.isNot}" @click="isNotCheck(el.isNot, i)">!</span>
              <select class="form-control" v-model="el.dateDiff">
                <option v-for="(item,k) in dateDiffList" :key="k" :value="item.value">{{item.text}}</option>
              </select>
            </div>
            <div class="col-3">
              <select class="form-control" v-if="operatorsList" v-model="el.selectedOperator" @change="selectOperator($event,el,i)">
                <option v-for="(item,k) in computedList(i)" :key="k" :value="item.id">{{item.name}}</option>
              </select>
            </div>
            <div class="col-3">
              <i class="fa fa-close red float-right" @click="deleteEl(i)"></i>
              <template v-if="el.viz === 'BINARY'">
                <input :class="{'form-control':true, 'is-invalid':checkQuotes(el.value[0])}" min="1" type="number" @blur="fillInput($event,i)" v-model="el.value[0]" />
              </template>
              <template v-else-if="el.viz === 'NARY'">
                <div v-for="(item,l) in el.value" :key="l" class="listing-lhs">
                  <input :class="{'form-control':true, 'is-invalid':checkQuotes(el.value[l])}" min="1" type="number" v-model="el.value[l]" />
                  <span class="del-link" @click="el.value.splice(l,1)">Remove</span>
                </div>
                <span class="link" @click="el.value.push('')">Add</span>
              </template>
              <template v-else-if="el.viz === 'UNARY'">
                <!-- <input type="text" v-model="el.value" /> -->
              </template>
              <template v-else-if="el.viz === 'TERNARY'">
                <label class="row">
                  <div class="col-6">
                    <input class="form-control" min="1" type="number" :value="el.value[0]" @blur="fillInput($event,i)" />
                  </div>
                  <div class="col-6">
                    <input class="form-control" min="1" type="number" :value="el.value[1]" @blur="fillInput($event,i)" />
                  </div>
                </label>
              </template>
            </div>
            <div class=" form-row col-12">
              <div class="col-6">
                <div>T1</div>
                <Enrich :pageType="pageType" :ruleAttrObj="ruleAttrObj" :parentTasks="tasks" :commonType="true" :el="el" :depth="depth" type="left" :operatorList="computedList(i)" @refreshBuilder="refreshBuilder"></Enrich>
              </div>
              <div class="col-6">
                <div>T2</div>
                <Enrich :pageType="pageType" :ruleAttrObj="ruleAttrObj" :parentTasks="tasks" :commonType="true" :el="el" :depth="depth" type="right" :operatorList="computedList(i)" @refreshBuilder="refreshBuilder"></Enrich>
              </div>
            </div>
          </div>
          <div v-else-if="el.name === 'operators'" class="row">
            <div class="col-12">
              {{el.name}}
              <ArrowNavRb
                :index="i"
                :length="tasks.length"
                :depth="depth"
                @leftClick="leftClick" @rightClick="rightClick" @upClick="upClick" @downClick="downClick">
              </ArrowNavRb>
            </div>
            <div class="col-2">
              <select class="form-control" v-if="operatorsList" v-model="el.selectedOperator" @change="selectOperator($event,el,i)">
                <option v-for="(item,k) in computedList(i)" :key="k" :value="item.id">{{item.name}}</option>
              </select>
            </div>
            <div class="col-12">
              <i class="fa fa-close red float-right" @click="deleteEl(i)"></i>
            </div>
          </div>
          <div v-else-if="el.id === 'split_ab_id'" class="row" >
            <div class="col-12">{{el.name}}
              <ArrowNavRb
                :index="i"
                :length="tasks.length"
                :depth="depth"
                @leftClick="leftClick" @rightClick="rightClick" @upClick="upClick" @downClick="downClick">
              </ArrowNavRb>
            </div>
            <div class="col-12">
              <i class="fa fa-close red float-right" @click="deleteEl(i)"></i>
            </div>
            <div class="form-row col-12" v-if="el.abSplitValue && el.abSplitValue.length">
              <div class="col-3" v-for="(value,s) in el.abSplitValue" :key="s">
                <div class="form-row col-12 row">
                  <div class="col-1 ml-2">{{String.fromCharCode(s+97)}}</div>
                  <div class="col-7">
                    <input :class="{'form-control':true, 'is-invalid':checkAbSplitValue(el.abSplitValue)}" min="1" v-model="el.abSplitValue[s]" max="100" type="number" />
                  </div>
                  <div class="col-3"><span class="del-link" @click="deleteAbSplit(el,s)">Delete</span></div>
                </div>
              </div>
              <div class="col-12">
              <span class="del-link" v-if="checkAbSplitValue(el.abSplitValue)">Sum of above values should be exact 100</span>
            </div>
            </div>
            <div><span class="link" @click="addAbSplit(el)">Click to Add value</span></div>
          </div>
          <div v-else-if="el.name === 'custom_attribute'" class="row" >
            <div class="col-12">
              &nbsp;
              <ArrowNavRb
                :index="i"
                :length="tasks.length"
                :depth="depth"
                @leftClick="leftClick" @rightClick="rightClick" @upClick="upClick" @downClick="downClick">
              </ArrowNavRb>
            </div>
            <div class="col-12">
              <i class="fa fa-close red float-right" @click="deleteEl(i)"></i>
              <!-- <Enrich :pageType="pageType" :ruleAttrObj="ruleAttrObj" :parentTasks="tasks" :commonType="true" :el="el" :depth="depth" type="left" :operatorList="computedList(i)" @refreshBuilder="refreshBuilder"></Enrich> -->
              <Enrich :pageType="pageType" :ruleAttrObj="ruleAttrObj"
                  :dataList="dataList"
                  :parentTaskIndex="parentTaskIndex" :parentTasks="tasks"
                  :commonType="true" :el="el" :depth="depth" type="left" :operatorList="computedList(i)" @refreshBuilder="refreshBuilder"></Enrich>
            </div>
          </div>
          <div v-else-if="el.name === 'array item'" class="row" >
            <div class="col-12">
              &nbsp;
              <ArrowNavRb
                :index="i"
                :length="tasks.length"
                :depth="depth"
                @leftClick="leftClick" @rightClick="rightClick" @upClick="upClick" @downClick="downClick">
              </ArrowNavRb>
            </div>
            <div class="col-12">
              <i class="fa fa-close red float-right" @click="deleteEl(i)"></i>
              <!-- <Enrich :pageType="pageType" :ruleAttrObj="ruleAttrObj" :parentTasks="tasks" :commonType="true" :el="el" :depth="depth" type="left" :operatorList="computedList(i)" @refreshBuilder="refreshBuilder"></Enrich> -->
              <Enrich :pageType="pageType" :ruleAttrObj="ruleAttrObj"
                  :dataList="dataList"
                  :parentTaskIndex="parentTaskIndex" :parentTasks="tasks"
                  :commonType="true" :el="el" :depth="depth" type="left" :operatorList="computedList(i)" @refreshBuilder="refreshBuilder"></Enrich>
            </div>
          </div>
          <div v-else-if="el.id === 'concat_id'" class="row" >
            <div class="col-12">{{el.name}}
              <input disabled placeholder="Enter Alias" v-model="el.alias" />
              <ArrowNavRb
                :index="i"
                :length="tasks.length"
                :depth="depth"
                @leftClick="leftClick" @rightClick="rightClick" @upClick="upClick" @downClick="downClick">
              </ArrowNavRb>
            </div>
            <div class="col-12">
              <i class="fa fa-close red float-right" @click="deleteEl(i)"></i>
            </div>
            <div class="col-1">
              <div class=""> &nbsp; </div>
              <select class="form-control" v-if="operatorsList" v-model="el.selectedOperator" @change="selectOperator($event,el,i)">
                <option v-for="(item,k) in computedList(i)" :key="k" :value="item.id">{{item.name}}</option>
              </select>
            </div>
            <div class="col-5">
              <div class=""> &nbsp; </div>
              <template v-if="el.viz === 'BINARY'">
                <input :class="{'form-control':true, 'is-invalid':!el.value[0]}" :type="inputType(el.datatype)" v-model="el.value[0]" />
              </template>
              <template v-else-if="el.viz === 'NARY'">
                <div v-for="(item,l) in el.value" :key="l" class="listing-lhs">
                  <input :class="{'form-control':true, 'is-invalid':!el.value[l]}" :type="inputType(el.datatype)" v-model="el.value[l]"/>
                  <span class="del-link" @click="el.value.splice(l,1)">Remove</span>
                </div>
                <span class="link" @click="el.value.push('')">Add</span>
              </template>
              <template v-else-if="el.viz === 'UNARY'">
              </template>
              <template v-else-if="el.viz === 'TERNARY'">
                <label class="row">
                  <div class="col-6">
                    <input class="form-control" :type="inputType(el.datatype)" :value="el.value[0]" @blur="fillInput($event,i)" />
                  </div>
                  <div class="col-6">
                    <input class="form-control" :type="inputType(el.datatype)" :value="el.value[1]" @blur="fillInput($event,i)" />
                  </div>
                </label>
              </template>
            </div>
            <div class="col-12" v-for="(concat,c) in el.concatInfo" :key="c">
              <span @click="(e) => el.concatInfo.splice(c,1)" class="fa fa-close del-link float-right mt-5"></span>
              <Enrich :pageType="pageType" :ruleAttrObj="ruleAttrObj" :commonType="true" :el="concat" :depth="depth" type="left" :operatorList="computedList(i)" @refreshBuilder="refreshBuilder"></Enrich>
            </div>
            <div class="col-12"><span class="link" @click="addConcat(el)">Click to Add Value</span></div>
          </div>
          <div v-else-if="el.name === 'enrich'" class="row">
            <div class="col-12">{{el.name}}
              <input disabled placeholder="Enter Alias" v-model="el.alias" />
              <ArrowNavRb
                :index="i"
                :length="tasks.length"
                :depth="depth"
                @leftClick="leftClick" @rightClick="rightClick" @upClick="upClick" @downClick="downClick">
              </ArrowNavRb>
            </div>
            <div class="col-12">
              <i class="fa fa-close red float-right" @click="deleteEl(i)"></i>
            </div>
            <div class="col-1">
              <div class=""> &nbsp; </div>
              <select class="form-control" v-if="operatorsList" v-model="el.selectedOperator" @change="selectOperator($event,el,i)">
                <option v-for="(item,k) in computedList(i)" :key="k" :value="item.id">{{item.name}}</option>
              </select>
            </div>
            <div class="col-5">
              <div class=""> &nbsp; </div>
              <template v-if="el.viz === 'BINARY'">
                <input :class="{'form-control':true, 'is-invalid':!el.value[0]}" :type="inputType(el.datatype)" v-model="el.value[0]" />
              </template>
              <template v-else-if="el.viz === 'NARY'">
                <div v-for="(item,l) in el.value" :key="l" class="listing-lhs">
                  <input :class="{'form-control':true, 'is-invalid':!el.value[l]}" :type="inputType(el.datatype)" v-model="el.value[l]"/>
                  <span class="del-link" @click="el.value.splice(l,1)">Remove</span>
                </div>
                <span class="link" @click="el.value.push('')">Add</span>
              </template>
              <template v-else-if="el.viz === 'UNARY'">
              </template>
              <template v-else-if="el.viz === 'TERNARY'">
                <label class="row">
                  <div class="col-6">
                    <input class="form-control" :type="inputType(el.datatype)" :value="el.value[0]" @blur="fillInput($event,i)" />
                  </div>
                  <div class="col-6">
                    <input class="form-control" :type="inputType(el.datatype)" :value="el.value[1]" @blur="fillInput($event,i)" />
                  </div>
                </label>
              </template>
            </div>
            <div class="col-12">
              <!-- <span :class="{'not-sign':true,'active':el.isNot}" @click="isNotCheck(el.isNot, i)">!</span> -->
              <Enrich :pageType="pageType" :ruleAttrObj="ruleAttrObj" :el="el" :depth="depth" type="left" :operatorList="computedList(i)" @refreshBuilder="refreshBuilder"></Enrich>
            </div>
            <div class="col-12">
              <Enrich :pageType="pageType" :ruleAttrObj="ruleAttrObj" :el="el" :depth="depth"   type="right" :operatorList="computedList(i)" @refreshBuilder="refreshBuilder"></Enrich>
            </div>
          </div>
          <div v-else-if="el.name === 'rule'" class="row">
            <div class="col-12">{{el.name}}
              <ArrowNavRb
                :index="i"
                :length="tasks.length"
                :depth="depth"
                @leftClick="leftClick" @rightClick="rightClick" @upClick="upClick" @downClick="downClick">
              </ArrowNavRb>
            </div>
            <div class="col-5">
              <span :class="{'not-sign':true,'active':el.isNot}" @click="isNotCheck(el.isNot, i)">!</span>
              <model-list-select
                :list="ruleList"
                option-value="id"
                option-text="name"
                v-model="el.selected_context"
                @input="selectRule(el,i)"
                placeholder="Select Rule"
              ></model-list-select>
            </div>
            <div class="col-7">
              <i class="fa fa-close red float-right" @click="deleteEl(i)"></i>
            </div>
          </div>
          <!-- .....REst Api Child Content view........ -->
          <div v-else-if="el.name === 'rest_api_attribute'" class="row">
            <div class="form-row col-12" v-if="checkOperator(el.selectedOperator)">
              <div class="col-12">
                <TreeView
                      componentName="rest_api_tree"
                      ref="my-tree"
                      :custom-styles="myCustomStyles"
                      :custom-options="myCustomOptions"
                      :nodes="el.rest_api_tasks"
                      featureAlias="none"
                      :topIndex="i"
                      :parentIndex="1"
                      parent_hierarchy=""
                      :dataset="{}"
                      :dateData="[]"
                    ></TreeView>
              </div>
            </div>
          </div>
  
          <!-- ..............REST API Parent VIEW.......... -->
           <div v-else-if="el.name === 'rest_api'" class="row">
            <div class="col-12">{{el.name}}
              <template>: <input disabled placeholder="Enter Alias" v-model="el.alias" /></template>
            </div>
            <div v-if="restApiList && restApiList.length"  class="col-3" >
              <span :class="{'not-sign':true,'active':el.isNot}" @click="isNotCheck(el.isNot, i)">!</span>
                <model-list-select
                   :class="{'is-invalid':!el.attribute_data.name}"
                    @input="() => getRestApiFunction(el,i)"
                    optionValue="id"
                    optionText="name"
                    v-model="el.attribute_data"
                   :list="restApiList"
                   placeholder="rest api"
                ></model-list-select>
            </div>
            <div v-else>
              There is no rest api list. Please create one.
            </div>
            <div v-if="restApiList && restApiList.length" class="col-3">
              <select class="form-control" v-if="operatorsList" v-model="el.selectedOperator" @change="selectOperator($event,el,i)">
                <option v-for="(item,k) in computedList(i)" :key="k" :value="item.id">{{item.name}}</option>
              </select>
            </div>
            <div class="col-6">
              <i class="fa fa-close red float-right" @click="deleteEl(i)"></i>
            </div>
          </div>
  
          <!-- ..............DEFAULT VIEW.......... -->
  
          <div class="row" v-else>
            <div class="col-12">
              {{ computeClassification(i) }}
              <template v-if="['custom functions','Array Filter'].includes(el.name) || (el.id).length === 36">: <input disabled placeholder="Enter Alias" v-model="el.alias" /></template>
              <ArrowNavRb
                :index="i"
                :length="tasks.length"
                :depth="depth"
                @leftClick="leftClick" @rightClick="rightClick" @upClick="upClick" @downClick="downClick">
              </ArrowNavRb>
              </div>
            <div :class="el.datatype === 'timestamp' && (el.symbol === 'lt' || el.symbol === 'gt' || el.symbol === 'eq')  ? 'col-2':  'col-3'">
              <span :class="{'not-sign':true,'active':el.isNot}" @click="isNotCheck(el.isNot, i)">!</span>
              <template v-if="el.name === 'attributes'">
                <model-select
                  v-model="el.attribute_id"
                  :options="attributesList"
                  @input="getAttributes(el,i)"
                  placeholder="default"
                ></model-select>
                {{el.sample_value}}
              </template>
              <template v-else-if="el.name === 'variables'">
                <model-select
                  v-model="el.selected_context"
                  :options="computeVariablesList"
                  @input="getAttributes(el,i)"
                  placeholder="default"
                ></model-select>
              </template>
              <template v-else-if="el.name === 'custom functions'">
                <model-select
                  v-model="el.attribute_id"
                  :options="computeCustomFunctionList"
                  @input="getCustomFunction(el,i)"
                  placeholder="default"
                ></model-select>
                {{el.cfParams}}
              </template>
              <template v-else-if="el.name === 'Array Filter'">
                <!-- <div class="col-12">{{el.name}}</div> -->
                <div class="col-12">{{el.cfParams}}</div>
              </template>
              <template v-else >
                  <model-select
                    v-model="el.attribute_id"
                    :options="computeAttributeList(el)"
                    @input="selectDataType(el.selected_context,el,i)"
                    placeholder="default"
                  ></model-select>
                  {{el.sample_value}}
              </template>
            </div>
            <div :class="{'col-2':el.no_expression}" v-if="el.no_expression && el.fields && el.fields.length">
              <treeselect
                v-model="el.tree_expression"
                :multiple="false"
                :searchable="true"
                @select="selectTree(el,i,'space_attribute',$event)"
                @input="selectTree(el,i,'space_attribute','clear')"
                :options="el.fields"
                :normalizer="normalizer"
                value-consists-of="ALL_WITH_INDETERMINATE"
                placeholder="Select attribute..."/>
                <template v-if="el.name === 'custom functions'">{{el.sample_value}}</template>
            </div>
            <div class="col-1">
              <select class="form-control" v-if="operatorsList" v-model="el.selectedOperator" @change="selectOperator($event,el,i)">
                <option v-for="(item,k) in computedList(i)" :key="k" :value="item.id">{{item.name}}</option>
              </select>
            </div>
            <div :class="el.fields && el.fields.length ? 'col-6': 'col-8'">
              <template v-if="el.symbol !== 'lt' && el.symbol !== 'gt' && el.symbol !== 'eq'">
                <i class="fa fa-close red float-right" @click="deleteEl(i)"></i>
              </template>
              <template v-if="el.viz === 'BINARY'">
                <div v-if="el.datatype === 'date' || el.datatype === 'datetime' || (el.datatype === 'timestamp' && (el.symbol !== 'lt' && el.symbol !== 'gt' && el.symbol !== 'eq'))" class="date-field">
                  <datetime v-if="el.datatype === 'date'" type="date" v-model="el.value[0]"></datetime>
                  <datetime v-else-if="el.datatype === 'datetime'|| el.datatype === 'timestamp'" type="datetime" v-model="el.value[0]"></datetime>
                </div>
                <Enrich v-else :pageType="pageType" :ruleAttrObj="ruleAttrObj"
                  :parentTaskIndex="parentTaskIndex" :parentTasks="tasks"
                  :commonType="true" :el="el" :depth="depth" type="left" :operatorList="computedList(i)" @refreshBuilder="refreshBuilder"></Enrich>
              </template>
              <template v-else-if="el.viz === 'NARY'">
                <div v-for="(item,l) in el.value" :key="l" class="listing-lhs">
                  <datetime v-if="el.datatype === 'date'" type="datetime" v-model="el.value[l]"></datetime>
                  <datetime v-else-if="el.datatype === 'datetime'" type="datetime" v-model="el.value[l]"></datetime>
                  <input v-else :class="{'form-control':true, 'is-invalid':checkQuotes(el.value[l])}" :type="inputType(el.datatype)" v-model="el.value[l]"/>
                  <span class="del-link" @click="el.value.splice(l,1)">Remove</span>
                </div>
                <span class="link" @click="el.value.push('')">Add</span>
              </template>
              <template v-else-if="el.viz === 'UNARY'">
              </template>
              <template v-else-if="el.viz === 'TERNARY'">
                <label v-if="el.datatype === 'date' || el.datatype === 'datetime'" class="row">
                  <div class="col-6">
                    <datetime :type="el.datatype" v-model="el.value[0]"></datetime>
                  </div>
                  <div class="col-6">
                    <datetime :type="el.datatype" v-model="el.value[1]"></datetime>
                  </div>
                </label>
                <label v-else class="row">
                  <div class="col-6">
                    <input class="form-control" :type="inputType(el.datatype)" :value="el.value[0]" @blur="fillInput($event,i)" />
                  </div>
                  <div class="col-6">
                    <input class="form-control" :type="inputType(el.datatype)" :value="el.value[1]" @blur="fillInput($event,i)" />
                  </div>
                </label>
              </template>
              <template v-else-if="el.datatype === 'hydra'">
                <div class="form-row" v-if="checkOperator(el.selectedOperator)">
                  <div v-for="(itemj,l) in el.value" :key="l" class="col-sm-12 form-row">
                      <div class="col-sm-8">
                          <model-select
                              v-model="itemj.name"
                              @input="setHydraTag(itemj,'code')"
                              :class="{'is-invalid':!itemj.name}"
                              :options="getHydraSegments(el)"
                              placeholder="default"
                          ></model-select>
                      </div>
                      <div :class="itemj.tag ? 'col-sm-2' : 'col-sm-2 invalid-tags'" :data-key="l" v-if="itemj && itemj.name && hydraTags[itemj.name].ab">
                          <model-select
                              v-model="itemj.tag"
                              @input="setHydraTag(itemj,'tag')"
                              :class="{'is-invalid':!itemj.tag}"
                              :options="getTags(el.value[l].name)"
                              placeholder="Select Tag"
                          ></model-select>
                      </div>
                      <div class="col-sm-2">
                        <button class="btn del-link" @click="deleteHydraSegments(i,l)" v-if="isInOperator(el.selectedOperator)">Delete</button>
                      </div>
                  </div>
                  <button v-if="isInOperator(el.selectedOperator)" class="btn link" @click="addHydraSegments(i)">Add Segment</button>
                </div>
              </template>
            </div>
            <div class="col-1 pr-2" v-if="el.datatype === 'timestamp' && (el.symbol === 'lt' || el.symbol === 'gt' || el.symbol === 'eq')">
              <i class="fa fa-close red float-right" @click="deleteEl(i)"></i>
              <select class="form-control" v-model="el.dateDiff">
                <option v-for="(item,k) in dateDiffList" :key="k" :value="item.value">{{item.text}}</option>
              </select>
            </div>
            <!-- <div class="col-1">
            </div> -->
  
          </div>
          <nested-draggable
            :pageType="pageType"
            :exp="el.exp"
            :refr="el.refr"
            :first="false"
            :isCustomFunction="['custom functions','Array Filter'].includes(el.name)"
            :cfParamsLength="el.cfParams && el.cfParams.length"
            :depth="depth + 1"
            :dataList="dataList"
            :ruleList="ruleList"
            :dateAttributeList="dateAttributeList"
            :customFunctionsList="customFunctionsList"
            :variablesList="variablesList"
            :attributesList="attributesList"
            :customFunctionApiNameList="customFunctionApiNameList"
            :customFunctionNameList="customFunctionNameList"
            :cusFuncMapping="cusFuncMapping"
            :controlAttrMapping="controlAttrMapping"
            :attributesMapping="attributesMapping"
            :dateConfig="dateConfig"
            :userHydraSegments="userHydraSegments"
            :hydraTags="hydraTags"
            :tasks="el.tasks"
            :parentTasks="tasks"
            :ref_type="ref_type"
            :parentTaskIndex="i"
            :cfRuleObj="cfRuleObj"
            :ruleAttrObj="ruleAttrObj"
            />
        </li>
      </draggable>
    </div>
  </template>
  <script>
  import { ModelSelect, ModelListSelect} from "vue-search-select";
  import draggable from "vuedraggable";
  // import QueryBuilder from "./../queryBuilder";
  import ArrowNavRb from "./ArrowNavigationRB.vue";
  import Enrich from "./EnrichDatatype.vue";
//   import Treeselect from '@riophae/vue-treeselect'
//   import '@riophae/vue-treeselect/dist/vue-treeselect.css'
//   import TreeView from "./datasetSchemaTreeView/treeView"
//   import { Datetime } from 'vue-datetime';
  import { getRuleAttribteSchemaDetails } from './RuleAttributeShcema.js';
  export default {
    name: "nested-draggable",
    components: {
      draggable,
      // QueryBuilder,
      ModelSelect,
      ArrowNavRb,
    //   Treeselect,
      Enrich,
      ModelListSelect,
    //   TreeView,
    //   Datetime
    },
    props: {
      pageType:String,
      userHydraSegments:Array,
      dateAttributeList:Array,
      parentTaskIndex: Number,
      parentTasks:Array,
      userHydraSegmentsCode:Array,
      customFunctionsList:Array,
      ruleList:Array,
      ref_type: String,
      restApiList:Array,
      cfParamsLength:Number,
      customFunctionApiNameList:Array,
      deviceHydraSegments:Array,
      deviceHydraSegmentsCode:Array,
      attributesList:Array,
      variablesList:Array,
      customFunctionNameList:Array,
      dateConfig:Array,
      isCustomFunction: Boolean,
      hydraTags: Object,
      cfRuleObj: Object,
      ruleAttrObj: Object,
      cusFuncMapping: Object,
      controlAttrMapping: Object,
      attributesMapping: Object,
      tasks: {
        required: true,
        type: Array
      },
      dataList: {
        required: true,
        type: Object
      },
      first:{
        type: Boolean
      },
      depth:{
        type: Number
      },
      exp: {
        required: true,
        type: Array
      },
      refr: Array
    },
    data: function(){
      return {
        // taskIndex: 0,
        treeSelectedRaw:['85b3e6a6_7f20_488e_baf8_5fc249b1fcb3'],
        dateDiffList: this.$store.state.dateDiffList,
        selectedOperator: "",
        ruleCFList: [],
        aliasList: [],
        hydraSegments: ['User', 'Device'],
        is_drag_disabled: false,
        // hydraOperators: ['CNT', 'NCNT', 'IN', 'NIN', 'IsNull', 'IsNotNull'],
        operators:{
          "equal to": {
            "symbol": "==",
            "type": "binary"
          },
          "not equal to": {
            "symbol": "!=",
            "type": "binary"
          }
        },
        dataType: {
          "string": {
            "operators": [],
            "viz_type": "textbox"
          }
        },
        operatorsList: [],
      features: [],
      attrSchema:{},
      // counterAttr:0,
      normalizer(node) {
        return {
          id: node.uid,
          label: node.name,
          children: node.fields && node.fields.length ? node.fields : "",
        }
      },
      }
    },
    computed:{
      computeTreeValue(){
        return this.attrSchema[this.treeSelectedRaw].parent + this.attrSchema[this.treeSelectedRaw].label;
      },
      getDateAttrList(){
        let attrList = []
        this.dateAttributeList.filter((item,i)=>{
          if(item.is_timestamp || (item.fields && item.fields.length)){
            attrList.push({value:item.id,text:"attribute-"+item.name})
          }
        });
        attrList.push({value:"target_run_ts/1000",text:"schedule_time"});
        return attrList;
      },
      computeVariablesList(){
        return this.variablesList;
      },
      computeCustomFunctionList(){
        let arr = this.customFunctionNameList.map((item,i) => {
          return {text:'#'+item.name, value:item.id}
        });
        return arr;
      },
      // messageAtList() {
      //   return this.$store.state.getMessageAt;
      // },
      expression(){
        if(this.tasks && this.tasks.length){
          // validation to populate arrayFilter Schema
          this.tasks.map(item => {
            if(item.name === "Array Filter"){
              // this.$store.dispatch("arrayFilterActive", true);
            }
            if(item.name === "array item" && item.params_index == 1){
              // this.$store.dispatch('arrayFilterSchema',item.left_schemaOptions)
            }
          })
        }
        this.generateExpression(this.tasks);
        return ""
      },
      myCustomStyles () {
        return {
          tree: {
            height: 'auto',
            maxHeight: '300px',
            overflowY: 'visible',
            display: 'inline-block'
          },
          row: {
            width: '100%',
            cursor: 'pointer',
            child: {
              height: '35px'
            }
          },
          text: {
            style: {},
            active: {
              style: {
                'font-weight': 'bold',
                color: '#2ECC71'
              }
            }
          }
        }
      },
      myCustomOptions () {
        return {
          treeEvents: {
            expanded: {
              state: false
            },
            collapsed: {
              state: false
            },
            selected: {
              state: false
            },
            checked: {
              state: true,
              fn: this.myCheckedFunction
            }
          },
          events: {
            expanded: {
              state: true
            },
            selected: {
              state: true
            },
            checked: {
              state: true
            },
            editableName: {
              state: true,
              calledEvent: 'expanded'
            }
          },
          addNode: {
            state: true,
            fn: this.addNodeFunction,
            appearOnHover: false
          },
          editNode: { state: false, fn: null, appearOnHover: false },
          deleteNode: {
            state: true,
            fn: this.deleteNodeFunction,
            appearOnHover: true
          },
          showTags: true
        }
      },
      // computeOperatorsList(){
      //   // console.log("computing",this.tasks)
      //   let data;
      //   this.tasks.filter(itemj => {
      //     itemj.attributes.filter((item,i) => {
      //       if(itemj.selected_context && (item.name === itemj.selected_context)){
      //         data = item
      //       }
      //     })
      //   })
      //   // console.log(data.datatype);
      //   // console.log(this.dataType[data.datatype].operators);
      //   return this.dataType[data.datatype].operators;
      // }
    },
    watch:{
      exp:{
        handler(val) {
            // console.log("exp changes", val);
          },
        deep:true
      },
      refr:{
        handler(val) {
            // console.log("refr changes", val);
          },
        deep:true
      },
      tasks:{
        handler(val) {
            this.generateExpression(val);
          },
        deep:true
      },
      // messageAtList: function(n, o) {
      //   if (n.length) {
      //     $(document).ready(() => {
      //       $(".msg-container").atwho({
      //         at: "$",
      //         data: this.messageAtList,
      //         limit: 200,
      //         startWithSpace: false
      //       });
      //     });
      //   }
      // }
    },
    created() {
        console.log("nested simple")
      this.dataType.string.operators = this.dataList.operators;
    },
    mounted(){
      if(this.tasks?.length){
        this.tasks.forEach((item,i) => {
          if(this.tasks[i]?.id === "rule_attribute_id" && this.tasks[0]?.selectedCFRule){
            this.getAliasList(i); // to auto populate rule alias value
          }
        })
      }
    },
    methods:{
      getRuleList: async function(searchText,i){
        if(searchText === ""){
          return
        }
        this.tasks[i].ruleCFList = [];
        this.searchText = searchText;
        clearTimeout(this.timeoutId);
        this.timeoutId = setTimeout(async () => {
          // Your API call logic here
          let list = await this.$getCall(this.$store.state.urls.ruleCfRegexListApi + searchText + "&rule_type=" + this.pageType)
          if(Object.keys(list).length > 0){
            for(let key in list){
              this.tasks[i].ruleCFList.push({text:key, value:list[key][0], details:list[key]});
            }
          }
          this.refreshBuilder();
        }, 300);
      },
      setHydraTag(itemj,type){
        console.log(itemj,type);
        if(type === "code"){
          itemj.code = this.hydraTags[itemj.name].segment_code;
          itemj.tag = "";
        }
      },
      deleteNodeFunction (node) {
        console.log(node)
      },
      clearLastElement (node) {
        if(node && node.fields && node.fields.length){
         node.fields.map(data => {
            if(['array','map','record'].includes(data.datatype)){
              this.clearLastElement(data)
            } else {
              data.old_aliases = ""
              data.old_sample_value = ""
              data.aliases = ""
              data.sample_value = ""
              data.readonly = false
              data._attribute_list = []
            }
            return data
          })
        }
        return node
      },
      addNodeFunction ({node,type,newName = ''}) {
          let newElement = JSON.parse(JSON.stringify(node.fields[0]))
          newElement.is_new = true
          newElement = this.clearLastElement(newElement)
          if(type === 'map') {
          newElement.name = newName
        }
          node.fields.push(newElement)
      },
      addConcat(el){
        el.concatInfo.push({"id":"concat_item_id_"+ Number(el.concatInfo.length) + 1, left_attr_type:"left_text"});
      },
      checkQuotes(str){
        return str.indexOf('\'') >= 0 || str.indexOf('"') >= 0
      },
      checkAbSplitValue(el){
        let value = 0;
        el.map(item =>  {
          value += Number(item)
        })
        return value !== 100;
      },
      deleteAbSplit(el,i){
        el.abSplitValue.splice(i,1)
      },
      addAbSplit(el){
        el.abSplitValue.push(1);
      },
      computeClassification(i){
        if(this.controlAttrMapping[this.tasks[i].id]){
          return this.controlAttrMapping[this.tasks[i].id];
        }else{
          return this.tasks[i].name;
        }
      },
      computeAliasList(item,i){
        return item ? this.cfRuleObj.aliasMapping[item] && this.cfRuleObj.aliasMapping[item].alias_list : [];
      },
      computeCFRuleShape(item,i){
        // console.log(item)
        this.tasks[i].selectedCFRuleFields = null;
        this.tasks[i].selectedCFRuleExpression = "";
        if(this.tasks.length === 0 || i === undefined){
          return;
        }
        let ruleAttr = this.tasks[i].cfRuleAliasMapping[this.tasks[i].selectedCFRule] && this.tasks[i].cfRuleAliasMapping[this.tasks[i].selectedCFRule].name
        let value = ruleAttr+"."+item
        let data = this.tasks[i].cfRuleShapeMapping[value];
        // console.log(data);
        if(data && data.attribute){
          console.log(data);
          if(data.attribute.fields && data.attribute.fields.length){
            this.$runScehma(data.attribute.fields,"");
            this.tasks[i].selectedCFRuleFields = data.attribute.fields
            this.tasks[i].obj_ref = JSON.parse(JSON.stringify(this.attrSchema));
          }
          if(data && data.attribute && data.attribute.sample_value){
            //  this.tasks[i].sample_value = this.$filteredSampleValue(data.attribute.sample_value);
          }
          this.tasks[i].datatype = data && data.attribute && data.attribute.is_timestamp ? "timestamp" : data.attribute.datatype;
          this.tasks[i].dateOutput = data && data.attribute && data.attribute.timestamp_format ? data.attribute.timestamp_format : "";
          if(data.ui_expression) {
            this.tasks[i].selectedCFRuleExpression = data.ui_expression
            this.tasks[i].expression = data.ui_expression
          }else {
            this.tasks[i].selectedCFRuleExpression = "${rule_variables."+ value +"}"
            this.tasks[i].expression = "${rule_variables."+ value +"}"
          }
          this.tasks[i].datatype = data?.datatype ? data.datatype : "string";
        } else {
          this.tasks[i].selectedCFRuleFields = null;
          this.tasks[i].selectedCFRuleExpression = "${rule_variables."+ value +"}";
          this.tasks[i].expression = "${rule_variables."+ value +"}";
          this.tasks[i].datatype = data?.datatype ? data.datatype : "string";
        }
        return this.tasks[i].expression;
      },
      selectCFRule(item,i){
        this.tasks[i].selectedCFRuleAlias = "";
        this.tasks[i].selectedCFRuleFields = null;
        this.tasks[i].selectedCFRuleExpression = "";
        this.getAliasList(i,true);
      },
      getAliasList:async function(i,listCreateFlag){
        this.aliasList = [];
        // console.log(this.tasks[i].selectedCFRule);
        if(this.tasks[i].selectedCFRule){
          let rule = this.tasks[i].selectedCFRule;
          await this.$getCall(this.$store.state.urls.ruleCfRegexDetailApi + rule + "&rule_type=" + this.pageType).then(async (res) => {
            if(listCreateFlag){
              this.tasks[i].ruleCFList = [{value:this.tasks[i].selectedCFRule, text: res[0]?.rule_name}];
            }
            this.tasks[i]["selectedCFRuleName"] = res[0]?.rule_name;
            this.tasks[i].ruleCFList = [{text: res[0]?.rule_name, value:rule}];
            await getRuleAttribteSchemaDetails(res).then(response => {
              let [cfRuleList, cfRuleShapeMapping, cfRuleAliasMapping] = [...response]
              this.tasks[i].aliasList = cfRuleAliasMapping[rule] && cfRuleAliasMapping[rule].alias_list ? cfRuleAliasMapping[rule].alias_list : [];
              this.aliasList = cfRuleAliasMapping[rule] && cfRuleAliasMapping[rule].alias_list ? cfRuleAliasMapping[rule].alias_list : [];
              this.tasks[i].cfRuleShapeMapping = cfRuleShapeMapping;
              this.tasks[i].cfRuleAliasMapping = cfRuleAliasMapping;
            });
          });
        } else{
          this.aliasList = []
        }
      },
      selectRuleAlias(item,i){
        this.tasks[i].selectedCFRuleShape = "";
        this.computeCFRuleShape(item,i)
      },
      uniqueValue(i){
        let oldCnt = this.$store.state.cf_counter;
        let cnt = this.$store.state.cf_counter + 1;
        if(this.$store.state.cfKey){
          if(this.$store.state.cfKey[this.depth+"_"+i]){
          }else{
            this.$store.commit("cfKey",{...this.$store.state.cfKey, [this.depth+"_"+i]: oldCnt})
            this.$store.commit("cf_counter",cnt);
          }
        }
        if(this.$store.state.cfKey){
          return `attribute_${this.$store.state.cfKey[this.depth+"_"+i]}`;
        }
      },
      fillInput(e,i){
        this.$set(this.tasks[i], "value", [e.target.value]);
      },
      noExp(item,type){
        // use in custom funnctions shape creation
        // type is user for date_diff
        // console.log(item.tree_expression_string)
        // console.log(item.obj_ref[item.tree_expression])
        // console.log(type, " ,obj: ", item.obj_ref, " ,one: "+item.tree_expression_date_one , " ,two: "+item.tree_expression_date_two );
  
        // to be removed: obj_ref shape object remove from nested_rule_json
        // if(item && item.obj_ref && item.tree_expression && item.obj_ref[item.tree_expression]){
        //   return item.no_expression ? item.obj_ref[item.tree_expression].parent+item.obj_ref[item.tree_expression].label:''
        // }
        if(item?.tree_expression_string?.label){
          return item.no_expression ? item.tree_expression_string?.parent+item.tree_expression_string.label : ''
        }
        return ""
      },
      selectTree(el,i,type,node){
        // type is used for date diff
        // console.log(el,i,type,node)
        // need to check whether this code is used or not due to enrich component
        if(node && node !== 'clear') {
          this.tasks[i].tree_expression_string = el.obj_ref[node.uid];
          if(type === 'dateDiffParamOne'){
            if(node.timestamp_format){
              this.$set(this.tasks[i], "tree_expression_date_one", node.ui_uid);
              this.tasks[i].tree_exprssion_one_string = el.obj_ref[node.uid];
              this.tasks[i].paramOneExpression = {...this.tasks[i].paramOneExpression, format:node.timestamp_format}
            }else{
              setTimeout(e => {
                alert("Please select only timestamp attribute");
                this.tasks[i].tree_expression_date_one = null;
              },50);
            }
          }else if(type === 'dateDiffParamTwo'){
            // console.log(el,i,el.tree_expression_date_two)
            if(node.timestamp_format){
              this.$set(this.tasks[i], "tree_expression_date_two", node.ui_uid)
              this.tasks[i].tree_exprssion_two_string = el.obj_ref_two[node.uid];
              this.tasks[i].paramTwoExpression = {...this.tasks[i].paramTwoExpression, format:node.timestamp_format}
            }else{
              setTimeout(e => {
                alert("Please select only timestamp attribute");
                this.tasks[i].tree_expression_date_two = null;
              },50);
            }
          }else if(type === 'rule_attributes'){
            // console.log("rule part")
            if(this.tasks[i].selectedCFRuleFields && this.tasks[i].selectedCFRuleFields.length){
              this.$runScehma(this.tasks[i].selectedCFRuleFields,"");
            }
            let data = this.tasks[i];
            el.sample_value = this.$filteredSampleValue(node.sample_value);
            el.datatype = node && node.is_timestamp ? 'timestamp' : node.datatype
            el.dateOutput = node && node.timestamp_format ? node.timestamp_format : "";
            // console.log(this.attrSchema, data.selectedCFRuleShape)
            setTimeout(e => {
              let ruleAttr = this.tasks[i].cfRuleAliasMapping[data.selectedCFRule] && this.tasks[i].cfRuleAliasMapping[data.selectedCFRule].name
              this.tasks[i].selectedCFRuleExpression = "${rule_variables."+ ruleAttr +"."+ data.selectedCFRuleAlias +"}" + this.attrSchema[data.selectedCFRuleShape].parent + this.attrSchema[data.selectedCFRuleShape].label
            },50)
            // console.log(el,i,el.tree_expression)
          }else if(type === 'space_attribute'){
            // console.log(type,node.sample_value)
            el.sample_value = this.$filteredSampleValue(node.sample_value);
            if(node.is_timestamp){
              el.datatype = "timestamp";
              el.dateOutput = node.timestamp_format;
            }else{
              el.datatype = node.datatype;
              el.dateOutput = "";
            }
            // this.tasks[i].datatype = node.is_timestamp ? "date" : "";
          }else{
            console.log('here 929')
            // el.sample_value = el.defaultSampleValue
            if(type !== "rule_attributes" && type !== 'space_attribute'){
              el.datatype = el.defaultDatatype;
            }
          }
        }else{
          // console.log("clear part");
          if(type === "rule_attributes"){
            if(this.tasks[i].selectedCFRuleFields && this.tasks[i].selectedCFRuleFields.length){
              this.$runScehma(this.tasks[i].selectedCFRuleFields,"");
            }
            let data = this.tasks[i];
            if(node !== 'clear'){
              el.datatype = node && node.is_timestamp ? 'timestamp' : node.datatype;
              el.dateOutput = node && node.timestamp_format ? node.timestamp_format : "";
              el.sample_value = this.$filteredSampleValue(node && node.sample_value);
            }
            // console.log(this.attrSchema, data)
            setTimeout(e => {
              let ruleAttr = this.tasks[i]?.cfRuleAliasMapping[data.selectedCFRule] && this.tasks[i]?.cfRuleAliasMapping[data.selectedCFRule].name
              let tree = data.selectedCFRuleShape ? this.attrSchema[data.selectedCFRuleShape].parent + this.attrSchema[data.selectedCFRuleShape].label : "";
              this.tasks[i].selectedCFRuleExpression = "${rule_variables."+ ruleAttr +"."+ data.selectedCFRuleAlias +"}" + tree;
              this.tasks[i].expression = "${rule_variables."+ ruleAttr +"."+ data.selectedCFRuleAlias +"}" + tree;
            },50)
          } else if(type !== 'space_attribute'){
            el.datatype = el.defaultDatatype;
          }
        }
        window.setTimeout(e => {
          this.refreshBuilder();
        },50)
      },
      customDate(date){
        let output = new Date(date).getTime();
        return `${output}/1000`
      },
      computeAttributeList(el){
        try{
          if(!["custom_attribute","rest_api_attribute"].includes(el.name)){
          if(this.controlAttrMapping[this.controlAttrMapping[el.id]]){
            return this.controlAttrMapping[this.controlAttrMapping[el.id]].map(item => {
              return {text:item.name, value:item.id}
            })
          }else{
            return this.controlAttrMapping[el.name].map(item => {
              return {text:item.name, value:item.id}
            })
          }
        }else{
          return [];
        }
        } catch(error) {
        console.log("🚀 ~ file: nested.vue ~ line 1175 ~ computeAttributeList ~ error", error)
        }
  
      },
      leftClick(i){
        let item = this.tasks.splice(i,1);
        this.parentTasks.splice(this.parentTaskIndex + 1,0,item[0])
        this.refreshBuilder();
      },
      rightClick(i){
        let item = this.tasks.splice(i,1);
        this.tasks[i-1].tasks.push(item[0]);
        this.refreshBuilder();
      },
      upClick(i){
        let item = this.tasks.splice(i,1);
        this.tasks.splice(i-1,0,item[0])
        this.refreshBuilder();
      },
      downClick(i){
        let item = this.tasks.splice(i,1);
        this.tasks.splice(i+1,0,item[0])
        this.refreshBuilder();
      },
      checkCustomFunction(i){
        if(this.isCustomFunction){
          return `${i>0 ? ', ':''}`
        }
        return "";
      },
      getOperatorValue(val,item,i){
        let operator = "";
        if(this.isCustomFunction){
          return ""
        }
        return item.joiner;
      },
      getAttributes:async function(val,i){
        // console.log("val", this.tasks[i])
        this.tasks[i].datatype = "string"
        this.tasks[i].expression = val.selected_context;
        let data;
        if(this.tasks[i].name === "attributes"){
          this.tasks[i].no_expression = false;
          this.tasks[i].fields = [];
          this.tasks[i].expression = "$" + this.attributesMapping[val.attribute_id]["name"];
          let id = this.attributesMapping[val.attribute_id].id
          // let id = this.attributesMapping[val.expression.substr(1)]
          data = await this.$getCall(this.$store.state.urls.attribute+id)
          this.tasks[i].datatype = data && data.datatype ?  data.datatype : "string";
          if(data.fields && data.fields.length){
            this.tasks[i].no_expression = true;
            this.tasks[i].fields = data.fields;
            this.selectDataType(val['name'],val,i,data)
          }else{
            if(data && data.sample_value){
              this.tasks[i].sample_value = this.$filteredSampleValue(data.sample_value);
              this.refreshBuilder();
            }
          }
        }
      },
      getRestApiFunction: async function(val,i){
      this.$store.commit('resetRestAttributes');
        let schemaData = []
        try {
          const id = val.attribute_data.data_set;
          const restApiId = val.attribute_data.id
          if (id) {
            let response = await this.$getCall(
              this.$store.state.urls.featureDatasetSchema +
                `latest?dataset_id=${id}`
            );
            if (response.length && response[0].raw_json && response[0].raw_json.length) {
              response[0].raw_json = response[0].raw_json.filter(data => data.name == 'request');
              schemaData = response[0].raw_json
            } else {
              alert('Schema shape should be inside request key');
              return;
            }
          }
        const customFunctionAttribute = Object.keys(this.cusFuncMapping).filter(key => this.cusFuncMapping[key].name === 'restApi')
        if(!customFunctionAttribute.length){
          alert('Unable to find custom function id for rest api')
          return;
        }
        this.tasks[i].type = "rest_api_schema";
        this.tasks[i].no_expression = false;
        this.tasks[i].datatype = "rest_api_datatype";
        this.tasks[i].selectedOperator = "";
        this.tasks[i].fields = [];
        this.tasks[i].custom_function_id = customFunctionAttribute[0]
        this.tasks[i].rest_api_id = restApiId
        const data = [ {
          "name": 'rest_api_attribute',
          "type":"rest_api_attribute",
          "id": "",
          "exp": [
              "#restApi"
          ],
          "left_attr_type": "left_text",
          "refr": [
              "#restApi"
          ],
          "symbol": "",
          "tasks": [],
          "rest_api_tasks":schemaData,
          "datatype": "string",
          "value": "",
          "viz": "",
          "output_expression": "#restApi",
          "reference_expression": "#restApi"
      },
        ]
        this.tasks[i].tasks = data
        this.refreshBuilder();
        } catch (err) {
            console.log("🚀 ~ file: nested.vue ~ line 1204 ~ getRestApiFunction:function ~ err", err)
        }
      },
      getCustomFunction:async function(val,i){
        this.tasks[i].tasks = [];
        this.tasks[i].expression =  "#"+this.cusFuncMapping[val.attribute_id].name;
        this.tasks[i].cfParams = this.cusFuncMapping[val.attribute_id].custom_function_param.map(item => {
          return item.attribute;
        });
        this.tasks[i].no_expression = false;
        this.tasks[i].datatype = this.cusFuncMapping[val.attribute_id].data_type;
        this.tasks[i].fields = [];
        let attributeId = this.cusFuncMapping[val.attribute_id].output_attribute;
        // console.log(this.tasks[i].cfParams.length)
        this.tasks[i].cfParams.map(item => {
          this.tasks[i].tasks.push({name:"custom_attribute", paramName:item, id:"custom_function_params", exp: [], left_attr_type:"left_text",refr: [], symbol:"", tasks: [], datatype:"string", value:"", viz:""});
        })
        // this.tasks[i].tasks = JSON.parse(JSON.stringify(this.tasks[i].tasks));
        if(attributeId){
          let data = await this.$getCall(this.$store.state.urls.attribute+attributeId)
          if(data.fields && data.fields.length){
            this.tasks[i].no_expression = true;
            this.tasks[i].fields = data.fields;
            this.selectDataType(val['name'],val,i,data)
          }
        }
        this.refreshBuilder();
      },
      // fillDynamicExpression(e,i){
      //   let item = e.target?.innerText;
      //   if (item !== "") {
      //     let val = this.$messageDecode(item, this.messageAtList);
      //     item = val;
      //   }
      //   this.tasks[i].value[0] = {
      //     expression: item,
      //     ui_expression: item,
      //   }
      //   this.tasks[i].value.push("")
      //   this.tasks[i].value.pop();
      // },
      // fillExpressionValue(e,i){
      //   let item = e.target.innerText;
      //   this.tasks[i].value[0] = {
      //     expression: item,
      //     ui_expression: item
      //   }
      //   this.tasks[i].value.push("")
      //   this.tasks[i].value.pop();
      // },
      isNotCheck(el,i){
        this.$set(this.tasks[i], "isNot", !el);
      },
      addHydraSegments(index) {
          this.tasks[index].value.push({name:"",tag:""});
      },
      deleteHydraSegments(index,hydraIndex) {
          if(this.tasks[index].value.length){
            this.tasks[index].value.splice(hydraIndex,1)
          }
      },
      isInOperator(item) {
          return item === 'IN' || item === 'NIN' || item === 'CNT';
      },
      getTags(hydra_segment) {
          let abTagsArr = [];
          Object.keys(this.hydraTags[hydra_segment].ab).map((item,i)=>{
              abTagsArr.push({ text: item , value: item });
          });
          return abTagsArr;
      },
      checkOperator(operator) {
          return operator !== 'IsNull' && operator !== 'IsNotNull' && operator !== "";
      },
      computeRHS(datatype,value,category,el){
        // console.log(datatype,value,category,el);
        let finalValue = "", dateInfo = this.dateConfig[0];
        if(el.dateOutput){
          this.dateConfig.filter(item => {
            if(item.output === el.dateOutput){
              dateInfo = item;
            }
          })
        }
        if(category === "NARY"){
          finalValue = `(`
          if(datatype === "string"){
            value?.length && value.map((item,i) => {
              if(i===0){
                finalValue +=  `'${item}'`
              } else {
                finalValue +=  `, '${item}'`
              }
            })
          } else if(datatype === "int" || datatype === "double" || datatype === "long"){
            value?.length && value.map((item,i) => {
              if(i===0){
                finalValue +=  `${item}`
              } else {
                finalValue +=  `, ${item}`
              }
            })
          } else if(el.symbol === "lt" || el.symbol === "gt" || el.symbol === "eq" || el.id ===  "date_diff_id"){
            value?.length && value.map((item,i) => {
              if(i===0){
                finalValue +=  `${item}`
              } else {
                finalValue +=  `, ${item}`
              }
            })
          } else {
            value?.length && value.map((item,i) => {
              let value = item;
              if(datatype === "date" || datatype === "datetime" ){
                value = this.$generateDate(item, dateInfo);
              }
              if(i===0){
                finalValue +=  `${value}`
              } else {
                finalValue +=  `, ${value}`
              }
            })
          }
          finalValue += `)`
        } else if(category === "BINARY"){
          let [enrichExp,enrichRef] = this.enrichExpression(el, "concat");
          if(datatype === "date" || datatype === "datetime" || (datatype === "timestamp" && (el.symbol !== "lt" && el.symbol !== "gt" && el.symbol !== "eq")) ){
              if(el.id === "rule_attribute_id"){
                finalValue = this.$generateDate(enrichExp, dateInfo) ? this.$generateDate(enrichExp, dateInfo) : "";
              }else {
                finalValue = this.$generateDate(value[0], dateInfo) ? this.$generateDate(value[0], dateInfo) : "";
              }
            }else{
              if(el.id === "date_diff_id" || el.id === "concat_id" || el.id === "enrich_id"){
                finalValue = value[0];
              }else{
                finalValue = enrichExp;
                if(datatype === "string"){
                  if(el.left_attr_type === "left_text"){
                    finalValue = `'${enrichExp}'`
                  }else{
                    finalValue = `${enrichExp}`
                  }
                } else if(datatype === "int" || datatype === "double" || datatype === "long"){
                  finalValue = `${enrichExp}`
                } else{
                  finalValue = `${enrichExp}`
                }
              }
              // if(datatype === "string" || (datatype === "long" && el.id !== "date_diff_id")){
              //   finalValue = `'${enrichExp}'`
              // } else if(datatype === "int" || datatype === "double"){
              //   finalValue = `${enrichExp}`
              // } else if(el.symbol === "lt" || el.symbol === "gt" || el.id ===  "date_diff_id"){
              //   finalValue = `${value[0]}`
              // } else{
              //   finalValue = `${enrichExp}`
              // }
            }
          } else if(category === "TERNARY"){
            if(datatype === "date" || datatype === "datetime" ){
              finalValue = "(" + this.$generateDate(value[0], dateInfo) + "," + this.$generateDate(value[1], dateInfo) + ")";
            }else{
              if(datatype === "string"){
                finalValue = `('${value[0]}','${value[1]}')`
              } else if(datatype === "int" || datatype === "double" || datatype === "long"){
                finalValue = `(${value[0]},${value[1]})`
              } else if(el.symbol === "lt" || el.symbol === "gt" || el.symbol === "eq" || el.id ===  "date_diff_id"){
                finalValue = `(${value[0]},${value[1]})`;
              } else{
                finalValue = `('${value[0]}','${value[1]}')`
              }
            }
        } else if(category === "UNARY"){
          finalValue = ``
        }
        // console.log(finalValue)
        return finalValue;
      },
      generateExpression(val){
        let exp = ""
        let reference_exp = ""
        let preview = ""
        let counter = 0;
        this.$emit("changeLog");
        val?.map((item,i) => {
          let finalValue = this.computeRHS(item.datatype, item.value, item.viz ,item)
          if(this.first && i === 0){
            item.joiner = "";
          }
          let preOn = false
          let postOn = false
          let rule_references = "${rule_references."
          let control_attribute = "${attribute_reference."
          if(item.tasks && item.tasks.length) {
            if(i===0 && val.length > 1 && !this.isCustomFunction){
              preOn = true;
              counter++;
            }
            if(val.length > 1 && i === (val.length - 1) && !this.isCustomFunction){
              postOn = true;
            }
            if(counter < 1 && !this.isCustomFunction){
              postOn = false;
            }
            if (item.name === "text"){
              window.setTimeout(() => {
                if(document.getElementById(`text-${this.depth}-${i}`) && document.getElementById(`text-${this.depth}-${i}`).classList['value'].split(" ").indexOf("added") === -1){
                  document.getElementById(`text-${this.depth}-${i}`).innerText = item.value[0].ui_expression;
                  document.getElementById(`text-${this.depth}-${i}`).classList.add("added");
                  console.log("added in expression");
                }
              },10)
              exp += ` ${this.checkCustomFunction(i)} ${this.getOperatorValue(val,item,i)} ${preOn ? '(':''} ${item.isNot ? 'not': ''} ( ${item.value[0].ui_expression} ${item.exp[0]} ${postOn ? ')':''} ) `;
              reference_exp += ` ${this.checkCustomFunction(i)} ${this.getOperatorValue(val,item,i)} ${preOn ? '(':''} ${item.isNot ? 'not': ''} ( ${item.value[0].ui_expression} ${item.refr[0]} ${postOn ? ')':''} ) `;
            } else if (item.datatype === "hydra") {
              exp += ` ${this.checkCustomFunction(i)} ${this.getOperatorValue(val,item,i)} ${preOn ? '(':''} ${item.isNot ? 'not(': ''} ${this.getHydraPreview(item)} ${item.exp[0]} ${postOn ? ')':''} ${item.isNot ? ')': ''}`;
              reference_exp += ` ${this.checkCustomFunction(i)} ${this.getOperatorValue(val,item,i)} ${preOn ? '(':''} ${item.isNot ? 'not(': ''} ${this.getHydraPreview(item)} ${item.refr[0]} ${postOn ? ')':''} ${item.isNot ? ')': ''}`;
            } else if (item.name === "query Builder") {
              let div = document.createElement('div')
              div.innerHTML = item.queryBuilder.preview;
              let queryData = div.innerText.replace(/\$\$/g,"$");
              exp += ` ${this.checkCustomFunction(i)} ${this.getOperatorValue(val,item,i)} ${preOn ? '(':''} ${item.isNot ? 'not': ''} ( ${queryData} ${postOn ? ')':''} ) `;
              reference_exp += ` ${this.checkCustomFunction(i)} ${this.getOperatorValue(val,item,i)} ${preOn ? '(':''} ${item.isNot ? 'not': ''} ( ${queryData} ${postOn ? ')':''} ) `;
            } else if (item.name === "operators") {
              exp += ` ${this.checkCustomFunction(i)} ${preOn ? '(':''}${item.symbol === '.' ? '.': ' '+item.symbol+' '}${postOn ? ')':''} `;
              reference_exp += ` ${this.checkCustomFunction(i)} ${preOn ? '(':''}${item.symbol === '.' ? '.': ' '+item.symbol+' '}${postOn ? ')':''} `;
            } else if (item.name === "custom functions") {
              item.alias = this.uniqueValue(i);
              let hash = item.expression ? item.expression.substr(0,1) : "";
              let hashValue = item.expression ? item.expression.substr(1) : "";
              exp += ` ${this.checkCustomFunction(i)} ${this.getOperatorValue(val,item,i)} ${preOn ? '(':''} ${item.isNot ? 'not(': ''} ${item.expression+'('+item.exp[0]+')'}${item.no_expression ? this.noExp(item) : ''}${item.symbol === '.' ? '.': ' '+item.symbol+' '}${finalValue} ${postOn ? ')':''} ${item.isNot ? ')': ''} `;
              reference_exp += ` ${this.checkCustomFunction(i)} ${this.getOperatorValue(val,item,i)} ${preOn ? '(':''} ${item.isNot ? 'not(': ''} ${hash + (item.alias ? item.alias +'@@@' : '') + hashValue}(${item.refr[0]})${item.no_expression ? this.noExp(item) : ''}${item.symbol === '.' ? '.': ' '+item.symbol+' '}${finalValue} ${postOn ? ')':''} ${item.isNot ? ')': ''} `;
            } else if (item.name === "rest_api") {
              this.is_drag_disabled = true
              item.alias = this.uniqueValue(i);
              const expressionData = item.attribute_data
              const hash = item.expression ? item.expression.substr(0,1) : "";
              const hashValue = item.expression ? item.expression.substr(1) : "";
              exp += `${item.expression}` + `(${expressionData.url},${expressionData.method},${expressionData.auth_header_key ?  expressionData.auth_header_key : null},${expressionData.auth_header_value ? expressionData.auth_header_value : null},${expressionData.rate_limit},${expressionData.data_set} | ${expressionData.data_set_name}) ${item.symbol === '.' ? '.': ' '+item.symbol+' '}`;
              reference_exp += hash + (item.alias ? item.alias +'@@@' : '') + `${hashValue}(` + `${expressionData.url},${expressionData.method},${expressionData.auth_header_key ? expressionData.auth_header_key : null},${expressionData.auth_header_value ? expressionData.auth_header_value : null},${expressionData.rate_limit},${expressionData.data_set} | ${expressionData.data_set_name})` + `${item.symbol === '.' ? '.': ' '+item.symbol+' '}`;
            } else if (item.name === "rule") {
              exp += ` ${this.checkCustomFunction(i)} ${this.getOperatorValue(val,item,i)} ${preOn ? '(':''} ${item.isNot ? 'not': ''} ${item.expression} ${item.exp[0]} ${postOn ? ')':''}`;
              reference_exp += ` ${this.checkCustomFunction(i)} ${this.getOperatorValue(val,item,i)} ${preOn ? '(':''} ${item.isNot ? 'not': ''} ${rule_references}${item.rule_id}} ${item.refr[0]} ${postOn ? ')':''}`;
            } else if (item.name === "rule_attributes") {
              let [expression,reference] = this.containsHandling(item,finalValue,control_attribute);
              exp += ` ${this.checkCustomFunction(i)} ${this.getOperatorValue(val,item,i)} ${preOn ? '(':''} ${item.isNot ? 'not': ''} ${expression} ${item.exp[0]} ${postOn ? ')':''}`;
              reference_exp += ` ${this.checkCustomFunction(i)} ${this.getOperatorValue(val,item,i)} ${preOn ? '(':''} ${item.isNot ? 'not': ''} ${reference} ${item.refr[0]} ${postOn ? ')':''}`;
            } else if (item.name === "date_diff") {
              let [enrichExp,enrichRef] = this.enrichExpression(item);
              exp += ` ${this.checkCustomFunction(i)} ${this.getOperatorValue(val,item,i)} ${preOn ? '(':''} ${item.isNot ? 'not': ''} ${item.name}( '${item.dateDiff}' , ${enrichExp} ) ${item.symbol} ${finalValue} ${item.exp[0]} ${postOn ? ')':''} `;
              reference_exp += ` ${this.checkCustomFunction(i)} ${this.getOperatorValue(val,item,i)} ${preOn ? '(':''} ${item.isNot ? 'not': ''} ${item.name}( '${item.dateDiff}' , ${enrichRef} ) ${item.symbol} ${finalValue} ${item.refr[0]} ${postOn ? ')':''} `;
            } else if (item.name === "enrich") {
              item.alias = this.uniqueValue(i);
              let [enrichExp,enrichRef] = this.enrichExpression(item);
              exp += ` ${this.checkCustomFunction(i)} ${this.getOperatorValue(val,item,i)} ${preOn ? '(':''} ${item.isNot ? 'not': ''} '#'${item.name}( ${enrichExp} ) ${item.symbol} ${finalValue} ${item.exp[0]} ${postOn ? ')':''} `;
              reference_exp += ` ${this.checkCustomFunction(i)} ${this.getOperatorValue(val,item,i)} ${preOn ? '(':''} ${item.isNot ? 'not': ''} ${'#'+(item.alias ? item.alias +'@@@' : '')+item.name}( ${enrichRef} ) ${item.symbol} ${finalValue} ${item.refr[0]} ${postOn ? ')':''} `;
            } else if (item.name === "custom_attribute") {
              // item.alias = this.uniqueValue(i);
              let [enrichExp,enrichRef] = this.enrichExpression(item, "concat");
              exp += ` ${this.checkCustomFunction(i)} ${this.getOperatorValue(val,item,i)} ${preOn ? '(':''} ${item.isNot ? 'not': ''} ${enrichExp}  ${item.symbol} ${finalValue} ${item.exp[0]} ${postOn ? ')':''} `;
              reference_exp += ` ${this.checkCustomFunction(i)} ${this.getOperatorValue(val,item,i)} ${preOn ? '(':''} ${item.isNot ? 'not': ''}  ${enrichRef} ${item.symbol} ${finalValue} ${item.refr[0]} ${postOn ? ')':''} `;
            } else if (item.name === "concat") {
              item.alias = this.uniqueValue(i);
              let [enrichExp,enrichRef] = this.concatExpression(item.concatInfo,i);
              exp += ` ${this.checkCustomFunction(i)} ${this.getOperatorValue(val,item,i)} ${preOn ? '(':''} ${item.isNot ? 'not': ''} #${item.name}( ${enrichExp} ) ${item.symbol} ${finalValue} ${item.exp[0]} ${postOn ? ')':''} `;
              reference_exp += ` ${this.checkCustomFunction(i)} ${this.getOperatorValue(val,item,i)} ${preOn ? '(':''} ${item.isNot ? 'not': ''} ${'#'+(item.alias ? item.alias +'@@@' : '') + item.name}( ${enrichRef} ) ${item.symbol} ${finalValue} ${item.refr[0]} ${postOn ? ')':''} `;
            } else if (item.id === "split_ab_id") {
              let abSplitExpression = "";
              item.abSplitValue.map((split,s) => {
                abSplitExpression += (s=== 0 ? "" : "|") + String.fromCharCode(s+97) + ":" + split;
              })
              exp += ` ${this.checkCustomFunction(i)} ${this.getOperatorValue(val,item,i)} ${preOn ? '(':''} ${item.isNot ? 'not': ''} #${item.name}( ${abSplitExpression} ) ${item.symbol} ${finalValue} ${item.exp[0]} ${postOn ? ')':''} `;
              reference_exp += ` ${this.checkCustomFunction(i)} ${this.getOperatorValue(val,item,i)} ${preOn ? '(':''} ${item.isNot ? 'not': ''} #${(item.name)}( ${abSplitExpression} ) ${item.symbol} ${finalValue} ${item.refr[0]} ${postOn ? ')':''} `;
            } else if (item.name === "attributes") {
              exp += ` ${this.checkCustomFunction(i)} ${this.getOperatorValue(val,item,i)} ${preOn ? '(':''} ${item.isNot ? 'not': ''} ${item.no_expression ? item.expression+this.noExp(item) : item.expression}${item.symbol === '.' ? '.': ' '+item.symbol+' '}${finalValue} ${item.exp[0]} ${postOn ? ')':''} `
              reference_exp += ` ${this.checkCustomFunction(i)} ${this.getOperatorValue(val,item,i)} ${preOn ? '(':''} ${item.isNot ? 'not': ''} ${item.no_expression ? item.expression+this.noExp(item) : item.expression}${item.symbol === '.' ? '.': ' '+item.symbol+' '}${finalValue} ${item.exp[0]} ${postOn ? ')':''} `
            } else if (item.name === "Array Filter") {
              item.alias = this.uniqueValue(i);
              let hash = item.expression ? item.expression.substr(0,1) : "";
              let hashValue = item.expression ? item.expression.substr(1) : "";
              //hash value need to be added in references to generate it, removed due to backend API
              exp += ` ${this.checkCustomFunction(i)} ${this.getOperatorValue(val,item,i)} ${preOn ? '(':''} ${item.isNot ? 'not(': ''} #filterArray${'('+item.exp[0]+')'}${item.no_expression ? this.noExp(item) : ''}${item.symbol === '.' ? '.': ' '+item.symbol+' '}${finalValue} ${postOn ? ')':''} ${item.isNot ? ')': ''} `;
              reference_exp += ` ${this.checkCustomFunction(i)} ${this.getOperatorValue(val,item,i)} ${preOn ? '(':''} ${item.isNot ? 'not(': ''} ${'#' + (item.alias ? item.alias +'@@@' : '') + 'filterArray'}(${item.refr[0]})${item.no_expression ? this.noExp(item) : ''}${item.symbol === '.' ? '.': ' '+item.symbol+' '}${finalValue} ${postOn ? ')':''} ${item.isNot ? ')': ''} `;
            } else if (item.name === "array item") {
              let [enrichExp,enrichRef] = this.enrichExpression(item, "array_item");
              // console.log(enrichExp,enrichRef);
              exp += ` ${this.checkCustomFunction(i)} ${this.getOperatorValue(val,item,i)} ${preOn ? '(':''} ${item.isNot ? 'not': ''} ${enrichExp} ${item.exp[0]} ${postOn ? ')':''} `;
              reference_exp += ` ${this.checkCustomFunction(i)} ${this.getOperatorValue(val,item,i)} ${preOn ? '(':''} ${item.isNot ? 'not': ''}  ${enrichRef} ${item.refr[0]} ${postOn ? ')':''} `;
            } else {
              // extra handling for contains symbol for spark and athena querties
              let [expression,reference] = this.containsHandling(item,finalValue,control_attribute);
              if(this.isCustomFunction){
                exp += `${i>0 ? ', ':''} ${item.isNot ? 'not( ': ''} ${expression} ${item.exp[0]} ${item.isNot ? ' )': ''}`
                reference_exp += `${i>0 ? ', ':''} ${item.isNot ? 'not( ': ''} ${reference} ${item.refr[0]} ${item.isNot ? ' )': ''}`
              }else {
                item.alias = this.uniqueValue(i);
                exp += ` ${this.getOperatorValue(val,item,i)} ${preOn ? '(':''} ${item.isNot ? 'not': ''} ${expression} ${item.exp[0]} ${postOn ? ')':''} `
                reference_exp += ` ${this.getOperatorValue(val,item,i)} ${preOn ? '(':''} ${item.isNot ? 'not': ''} ${reference} ${item.refr[0]} ${postOn ? ')':''} `
              }
            }
          } else {
            let preOn = false
            let postOn = false
            if(i === 0 && val.length > 1 && !this.isCustomFunction){
              preOn = true;
              counter++;
            }
            if(val.length > 1 && i === (val.length - 1) && !this.isCustomFunction){
              postOn = true;
            }
            if(counter < 1 && !this.isCustomFunction){
              postOn = false;
            }
            // console.log("no len:", i ,"is cus: ", this.isCustomFunction ,preOn, postOn);
            if (item.name === "text"){
              window.setTimeout(() => {
                if(document.getElementById(`text-${this.depth}-${i}`) && document.getElementById(`text-${this.depth}-${i}`).classList['value'].split(" ").indexOf("added") === -1){
                  document.getElementById(`text-${this.depth}-${i}`).innerText = item.value[0].ui_expression;
                  document.getElementById(`text-${this.depth}-${i}`).classList.add("added");
                }
              },10)
              exp += ` ${this.checkCustomFunction(i)} ${this.getOperatorValue(val,item,i)} ${preOn ? '(':''} ${item.isNot ? 'not(': ''} ${item.value[0].ui_expression} ${item.exp[0]} ${postOn ? ')':''} ${item.isNot ? ')': ''} `;
              reference_exp += ` ${this.checkCustomFunction(i)} ${this.getOperatorValue(val,item,i)} ${preOn ? '(':''} ${item.isNot ? 'not(': ''} ${item.value[0].ui_expression} ${item.refr[0]} ${postOn ? ')':''}  ${item.isNot ? ')': ''} `;
            } else if (item.datatype === "hydra") {
              exp += ` ${this.checkCustomFunction(i)} ${this.getOperatorValue(val,item,i)} ${preOn ? '(':''} ${item.isNot ? 'not(': ''} ${this.getHydraPreview(item)} ${postOn ? ')':''} ${item.isNot ? ')': ''} `;
              reference_exp += ` ${this.checkCustomFunction(i)} ${this.getOperatorValue(val,item,i)} ${preOn ? '(':''} ${item.isNot ? 'not(': ''} ${this.getHydraPreview(item)} ${postOn ? ')':''} ${item.isNot ? ')': ''}`;
            } else if (item.name === "query Builder") {
              // console.log(item.queryBuilder.preview)
              let div = document.createElement('div')
              div.innerHTML = item.queryBuilder.preview;
              let queryData = div.innerText.replace(/\$\$/g,"$");
              exp += ` ${this.checkCustomFunction(i)} ${this.getOperatorValue(val,item,i)} ${preOn ? '(':''} ${item.isNot ? 'not': ''} ( ${queryData} ${postOn ? ')':''} ) `;
              reference_exp += ` ${this.checkCustomFunction(i)} ${this.getOperatorValue(val,item,i)} ${preOn ? '(':''} ${item.isNot ? 'not': ''} ( ${queryData} ${postOn ? ')':''} ) `;
            } else if (item.name === "operators") {
              // console.log('here in else operator')
              exp += ` ${this.checkCustomFunction(i)} ${preOn ? '(':''}${item.symbol === '.' ? '.': ' '+item.symbol+' '}${postOn ? ')':''} `;
              reference_exp += ` ${this.checkCustomFunction(i)} ${preOn ? '(':''}${item.symbol === '.' ? '.': ' '+item.symbol+' '}${postOn ? ')':''} `;
            } else if (item.name === "custom functions") {
              item.alias = this.uniqueValue(i);
              let hash = item.expression ? item.expression.substr(0,1) : "";
              let hashValue = item.expression ? item.expression.substr(1) : "";
              exp += ` ${this.checkCustomFunction(i)} ${this.getOperatorValue(val,item,i)} ${preOn ? '(':''} ${item.isNot ? 'not': ''}(${item.expression}${item.exp[0]}${item.no_expression ? this.noExp(item) : ''}${item.symbol === '.' ? '.': ' '+item.symbol+' '}${finalValue} ) ${postOn ? ')':''}`;
              reference_exp += ` ${this.checkCustomFunction(i)} ${this.getOperatorValue(val,item,i)} ${preOn ? '(':''} ${item.isNot ? 'not': ''}(${hash + (item.alias ? item.alias +'@@@' : '')+ hashValue}${item.refr[0]}${item.no_expression ? this.noExp(item) : ''}${item.symbol === '.' ? '.': ' '+item.symbol+' '}${finalValue} ) ${postOn ? ')':''}`;
            } else if (item.name === "rest_api") {
              this.is_drag_disabled = true
              item.expression = '#restApi'
              item.alias = this.uniqueValue(i);
              item.attribute_data = {}
              item.datatype = 'rest_api_datatype'
              const expressionData = item.attribute_data
              const hash = item.expression ? item.expression.substr(0,1) : "";
              const hashValue = item.expression ? item.expression.substr(1) : "";
              exp += `${item.expression}` + `(${expressionData.url},${expressionData.method},${expressionData.auth_header_key ?  expressionData.auth_header_key : null},${expressionData.auth_header_value ? expressionData.auth_header_value : null},${expressionData.rate_limit},${expressionData.data_set} | ${expressionData.data_set_name}) ${item.symbol === '.' ? '.': ' '+item.symbol+' '}`;
              reference_exp += hash + (item.alias ? item.alias +'@@@' : '') + `${hashValue}(` + `${expressionData.url},${expressionData.method},${expressionData.auth_header_key ? expressionData.auth_header_key : null},${expressionData.auth_header_value ? expressionData.auth_header_value : null},${expressionData.rate_limit},${expressionData.data_set} | ${expressionData.data_set_name}` + `${item.symbol === '.' ? '.': ' '+item.symbol+' '}`;
            } else if (item.name === "rule") {
              exp += ` ${this.checkCustomFunction(i)} ${this.getOperatorValue(val,item,i)} ${preOn ? '(':''} ${item.isNot ? 'not': ''} ${item.expression} ${postOn ? ')':''} `;
              reference_exp += ` ${this.checkCustomFunction(i)} ${this.getOperatorValue(val,item,i)} ${preOn ? '(':''} ${item.isNot ? 'not': ''} ${rule_references}${item.rule_id}} ${postOn ? ')':''} `;
            } else if (item.name === "rule_attributes") {
              let [expression,reference] = this.containsHandling(item,finalValue,control_attribute);
              exp += ` ${this.checkCustomFunction(i)} ${this.getOperatorValue(val,item,i)} ${preOn ? '(':''} ${item.isNot ? 'not': ''} ${expression} ${postOn ? ')':''}`;
              reference_exp += ` ${this.checkCustomFunction(i)} ${this.getOperatorValue(val,item,i)} ${preOn ? '(':''} ${item.isNot ? 'not': ''} ${reference} ${item.refr[0]} ${postOn ? ')':''}`;
            } else if (item.name === "date_diff") {
              let [enrichExp,enrichRef] = this.enrichExpression(item);
              exp += ` ${this.checkCustomFunction(i)} ${this.getOperatorValue(val,item,i)} ${preOn ? '(':''} ${item.isNot ? 'not': ''} ${item.name}( '${item.dateDiff}' , ${enrichExp} ) ${item.symbol} ${finalValue} ${postOn ? ')':''} `;
              reference_exp += ` ${this.checkCustomFunction(i)} ${this.getOperatorValue(val,item,i)} ${preOn ? '(':''} ${item.isNot ? 'not': ''} ${item.name}( '${item.dateDiff}' , ${enrichRef} ) ${item.symbol} ${finalValue} ${postOn ? ')':''} `;
            } else if (item.name === "enrich") {
              item.alias = this.uniqueValue(i);
              let [enrichExp,enrichRef] = this.enrichExpression(item);
              exp += ` ${this.checkCustomFunction(i)} ${this.getOperatorValue(val,item,i)} ${preOn ? '(':''} ${item.isNot ? 'not': ''} ${'#'+item.name}( ${enrichExp} ) ${item.symbol} ${finalValue} ${postOn ? ')':''} `;
              reference_exp += ` ${this.checkCustomFunction(i)} ${this.getOperatorValue(val,item,i)} ${preOn ? '(':''} ${item.isNot ? 'not': ''} ${'#'+(item.alias ? item.alias +'@@@' : '')+item.name}( ${enrichRef} ) ${item.symbol} ${finalValue} ${postOn ? ')':''} `;
            } else if (item.name === "custom_attribute") {
              let [enrichExp,enrichRef] = this.enrichExpression(item, "concat");
              exp += ` ${this.checkCustomFunction(i)} ${this.getOperatorValue(val,item,i)} ${preOn ? '(':''} ${item.isNot ? 'not': ''} ${enrichExp}  ${item.symbol} ${finalValue} ${item.exp[0]} ${postOn ? ')':''} `;
              reference_exp += ` ${this.checkCustomFunction(i)} ${this.getOperatorValue(val,item,i)} ${preOn ? '(':''} ${item.isNot ? 'not': ''}  ${enrichRef} ${item.symbol} ${finalValue} ${item.refr[0]} ${postOn ? ')':''} `;
            } else if (item.name === "concat") {
              item.alias = this.uniqueValue(i);
              let [enrichExp,enrichRef] = this.concatExpression(item.concatInfo,i);
              exp += ` ${this.checkCustomFunction(i)} ${this.getOperatorValue(val,item,i)} ${preOn ? '(':''} ${item.isNot ? 'not': ''} #${item.name}( ${enrichExp} ) ${item.symbol} ${finalValue} ${postOn ? ')':''} `;
              reference_exp += ` ${this.checkCustomFunction(i)} ${this.getOperatorValue(val,item,i)} ${preOn ? '(':''} ${item.isNot ? 'not': ''} ${'#'+(item.alias ? item.alias +'@@@' : '') + item.name}( ${enrichRef} ) ${item.symbol} ${finalValue} ${postOn ? ')':''} `;
            } else if (item.id === "split_ab_id") {
              let abSplitExpression = "";
              item.abSplitValue.map((split,s) => {
                abSplitExpression += (s=== 0 ? "" : "|") + String.fromCharCode(s+97) + ":" + split;
              })
              exp += ` ${this.checkCustomFunction(i)} ${this.getOperatorValue(val,item,i)} ${preOn ? '(':''} ${item.isNot ? 'not': ''} #${item.name}( ${abSplitExpression} ) ${item.symbol} ${finalValue} ${item.exp[0]} ${postOn ? ')':''} `;
              reference_exp += ` ${this.checkCustomFunction(i)} ${this.getOperatorValue(val,item,i)} ${preOn ? '(':''} ${item.isNot ? 'not': ''} #${(item.name)}( ${abSplitExpression} ) ${item.symbol} ${finalValue} ${item.refr[0]} ${postOn ? ')':''} `;
            } else if (item.name === "attributes") {
                exp += ` ${this.checkCustomFunction(i)} ${this.getOperatorValue(val,item,i)} ${preOn ? '(':''}${item.isNot ? 'not': ''} ${item.no_expression ? item.expression+this.noExp(item) : item.expression}${item.symbol === '.' ? '.': ' '+item.symbol+' '}${finalValue} ${postOn ? ')':''}`
                reference_exp += ` ${this.checkCustomFunction(i)} ${this.getOperatorValue(val,item,i)} ${preOn ? '(':''} ${item.isNot ? 'not': ''} ${item.no_expression ? item.expression+this.noExp(item) : item.expression}${item.symbol === '.' ? '.': ' '+item.symbol+' '}${finalValue} ${postOn ? ')':''}`
            } else if (item.name === "Array Filter") {
              let [enrichExp,enrichRef] = this.enrichExpression(item, "concat");
              exp += ` ${this.checkCustomFunction(i)} ${this.getOperatorValue(val,item,i)} ${preOn ? '(':''} ${item.isNot ? 'not': ''} ${enrichExp}  ${item.symbol} ${finalValue} ${item.exp[0]} ${postOn ? ')':''} `;
              reference_exp += ` ${this.checkCustomFunction(i)} ${this.getOperatorValue(val,item,i)} ${preOn ? '(':''} ${item.isNot ? 'not': ''}  ${enrichRef} ${item.symbol} ${finalValue} ${item.refr[0]} ${postOn ? ')':''} `;
            } else if (item.name === "array item") {
              let [enrichExp,enrichRef] = this.enrichExpression(item, "array_item");
              exp += ` ${this.checkCustomFunction(i)} ${this.getOperatorValue(val,item,i)} ${preOn ? '(':''} ${item.isNot ? 'not': ''} ${enrichExp} ${item.exp[0]} ${postOn ? ')':''} `;
              reference_exp += ` ${this.checkCustomFunction(i)} ${this.getOperatorValue(val,item,i)} ${preOn ? '(':''} ${item.isNot ? 'not': ''} ${enrichRef} ${item.refr[0]} ${postOn ? ')':''} `;
            } else {
              // extra handling for contains symbol for spark and athena queries
              let [expression,reference] = this.containsHandling(item,finalValue,control_attribute);
              if(this.isCustomFunction){
                exp += ` ${i>0 ? ', ':''} ${item.isNot ? 'not(': ''} ${expression} ${item.isNot ? ' )': ''} `
                reference_exp += ` ${i>0 ? ', ':''} ${item.isNot ? 'not(': ''} ${reference} ${item.isNot ? ' )': ''} `
              }else {
                item.alias = this.uniqueValue(i);
                exp += ` ${this.getOperatorValue(val,item,i)} ${preOn ? '(':''} ${item.isNot ? 'not': ''} ${expression} ${postOn ? ')':''} `
                reference_exp += ` ${this.getOperatorValue(val,item,i)} ${preOn ? '(':''} ${item.isNot ? 'not': ''} ${reference} ${postOn ? ')':''} `
              }
            }
          }
          if(val.length > 1 && i === (val.length - 1)){
            counter--;
          }
          this.tasks[i].output_expression = exp;
          this.tasks[i].reference_expression = reference_exp;
        })
        this.exp[0] = exp;
        this.refr[0] = reference_exp;
      },
      concatExpression(arr,i){
        let exp = "", ref = "";
        arr.map((item,j) => {
          let data =  this.enrichExpression(item,'concat')
          exp += j === 0 ? data[0] : " , " + data[0]
          ref += j === 0 ? data[1] : " , " + data[1]
        })
        return [exp,ref]
      },
      enrichExpression(item,type){
        let leftValue = item.left_schemaValue ? item.left_schemaValue : '';
        let rightValue = item.right_schemaValue ? item.right_schemaValue : '';
        let left_enrich_type, right_enrich_type;
  
        if(item.left_enrich_type === "attribute"){ // || item.rhs && item.rhs.length && item.rhs[0].right_enrich_type === "attribute"
          left_enrich_type = "${attribute_reference."
        }else if(item.left_enrich_type === "custom_wrapped_attribute"){
          left_enrich_type = "${custom_attribute_reference."
        }
  
        if(item.right_enrich_type === "attribute"){
          right_enrich_type = "${attribute_reference."
        }else if(item.right_enrich_type === "custom_wrapped_attribute"){
          right_enrich_type = "${custom_attribute_reference."
        }
  
        let leftRef = "", rightRef = "";
        // console.log(item,'before refs');
        if(item.left_enrich_type === "rule"){
          leftRef = item.left_modalAttribute
        }else if(item.left_attr_type === "left_array_filter"){
          if(item.rhs && item.rhs.length){
            if(item.rhs[0].right_enrich_type === "attribute"){
              // rightRef = "${attribute_reference." + item.rhs[0].right_selectedAttribute + "}"
            }else if(item.rhs[0].right_enrich_type === "rule"){
              rightRef = item.rhs[0].right_modalAttribute;
            }else if(item.rhs[0].right_enrich_type === "custom_wrapped_attribute"){
              // rightRef = "${custom_attribute_reference." + item.rhs[0].right_selectedAttribute + "}"
            }
          }
        }else {
          leftRef = left_enrich_type + item.left_selectedAttribute + "}"
        }
  
        if(item.right_enrich_type === "rule" || item.right_attr_type === "right_array_filter"){
          rightRef = item.right_modalAttribute
        }else if(item.right_enrich_type === "attribute"){
          rightRef = right_enrich_type + item.right_selectedAttribute + "}"
        }else{
          rightRef = right_enrich_type + item.right_selectedAttribute + "}"
        }
  
        let exp, ref;
        let leftDateExp, rightDateExp,leftDateRef, rightDateRef;
        if(type === 'concat'){
          exp = `${item.left_modalAttribute + leftValue}`;
          ref = `${item.left_modalAttribute + leftValue}`;
        }else{
          // console.log(item.left_is_timestamp, item.left_dateOutput, item.right_is_timestamp, item.right_dateOutput)
          if(item.id === "date_diff_id"){
            let dateInfo = this.dateConfig[0]
            // console.log("1787777777",item)
            if(item.left_attr_type === "left_text"){
              let date = this.$generateDate(item.left_modalAttribute, dateInfo);
              let val = date ? date : "";
              // console.log(val)
              leftDateExp = val;
              leftDateRef = val;
              item.left_dateOutput = '';
              item.left_is_timestamp = false;
            }else if(item.left_is_timestamp){
              let leftArrFilterFlag = item.left_attr_type === "left_array_filter" ? "x" : "";
              if(item.left_dateOutput === 'epochSeconds'){
                let milliesTimeExp = ""
                if(this.pageType === "dsl"){
                  milliesTimeExp = " * 1000"
                }
                leftDateExp = ` ${leftArrFilterFlag + item.left_modalAttribute + leftValue} ${milliesTimeExp}`;
                leftDateRef = ` ${leftArrFilterFlag + leftRef + leftValue} `;
              } else if(item.left_dateOutput === 'epochMilliSeconds'){
                let milliesTimeExp = " /1000"
                if(this.pageType === "dsl"){
                  milliesTimeExp = ""
                }
                leftDateExp = ` ${leftArrFilterFlag + item.left_modalAttribute + leftValue} ${milliesTimeExp}`;
                leftDateRef = ` ${leftArrFilterFlag + leftRef + leftValue} ${milliesTimeExp}`;
              } else{
                leftDateExp = `to_unix_timestamp( ${leftArrFilterFlag + item.left_modalAttribute + leftValue},'${item.left_dateOutput}' )`;
                leftDateRef = `to_unix_timestamp( ${leftArrFilterFlag + leftRef + leftValue},'${item.left_dateOutput}' )`;
              }
            }else if(item.left_enrich_type === "custom_wrapped_attribute"){
              leftDateExp = ` ${item.left_modalAttribute + leftValue}`;
              leftDateRef = ` ${leftRef + leftValue} `;
            }else if(item.left_attr_type === "left_array_filter"){
              leftDateExp = `x${leftValue}`;
              leftDateRef = `x${leftRef + leftValue}`;
            }
  
            if(item.right_attr_type === "right_text"){
              let date = this.$generateDate(item.right_modalAttribute, dateInfo);
              let val = date ? date : "";
              rightDateExp = val;
              rightDateRef = val;
              item.right_dateOutput = '';
              item.right_is_timestamp = false;
            }else if(item.right_is_timestamp){
              let rightArrFilterFlag = item.right_attr_type === "right_array_filter" ? "x" : "";
              if(item.right_dateOutput === 'epochSeconds'){
                let milliesTimeExp = ""
                if(this.pageType === "dsl"){
                  milliesTimeExp = " * 1000"
                }
                rightDateExp = ` ${rightArrFilterFlag + item.right_modalAttribute + rightValue} ${milliesTimeExp}`;
                rightDateRef = ` ${rightArrFilterFlag + rightRef + rightValue} `;
              } else if(item.right_dateOutput === 'epochMilliSeconds'){
                let milliesTimeExp = " /1000"
                if(this.pageType === "dsl"){
                  milliesTimeExp = ""
                }
                rightDateExp = ` ${rightArrFilterFlag + item.right_modalAttribute + rightValue} ${milliesTimeExp}`;
                rightDateRef = ` ${rightArrFilterFlag + rightRef + rightValue} ${milliesTimeExp}`;
              } else{
                // console.log(rightRef , rightValue)
                rightDateExp = `to_unix_timestamp( ${rightArrFilterFlag + item.right_modalAttribute + rightValue},'${item.right_dateOutput}' )`;
                rightDateRef = `to_unix_timestamp( ${rightArrFilterFlag + rightRef + rightValue},'${item.right_dateOutput}' )`;
              }
            }else if(item.right_enrich_type === "custom_wrapped_attribute"){
              rightDateExp = ` ${item.right_modalAttribute + rightValue}`;
              rightDateRef = ` ${rightRef + rightValue} `;
            }else if(item.right_attr_type === "right_array_filter"){
              rightDateExp = `x${rightValue}`;
              rightDateRef = `x${rightRef + rightValue}`;
            }
          }
          if(item.id === "date_diff_id"){
            // console.log(leftDateExp, rightDateExp)
            exp = `${leftDateExp} , ${rightDateExp}`;
            ref = `${leftDateRef} , ${rightDateRef}`;
          }else if(item.id === "array_attribute_params" && item.params_index === 2){
            let rightValue = "";
            if(item.left_attr_type === "left_text"){
              exp = item.left_modalAttribute;
              ref = item.left_modalAttribute;
            }else{
              if(item.rhs && item.rhs.length){
                // console.log(item.rhs)
                let schemaValue = item.rhs[0].right_schemaValue ? item.rhs[0].right_schemaValue : '';
                if(item.rhs[0].right_attr_type === "right_text"){
                  rightValue = item.rhs[0].right_modalAttribute;
                  if(['string'].includes(item.datatype)){
                    rightValue = `'${rightValue}'`
                  }
                }else if(item.rhs[0].right_enrich_type === "attribute"){
                  rightValue = item.rhs[0].right_modalAttribute + schemaValue;
                }else if(item.rhs[0].right_enrich_type === "rule"){
                  rightValue = item.rhs[0].right_modalAttribute + schemaValue;
                }else if(item.rhs[0].right_attr_type === "right_array_filter"){
                  rightValue = 'x'+item.rhs[0].right_schemaValue;
                }
              }
              let array_item_text = "";
              if(item?.viz === 'NARY'){
                array_item_text = "( "+ rightValue +" )";
              }else{
                array_item_text = rightValue;
              }
              exp = `x${leftValue} ${item.symbol} ${array_item_text}`;
              ref = `x${leftValue} ${item.symbol} ${array_item_text}`;
            }
          }else if(item.id === "array_attribute_params" && item.params_index === 1){
            exp = `${item.left_modalAttribute + leftValue}`;
            ref = `${leftRef + leftValue}`;
          }else {
            exp = `${item.left_modalAttribute + leftValue} , ${item.right_modalAttribute + rightValue}`;
            ref = `${leftRef + leftValue} , ${rightRef + rightValue}`;
          }
        }
        // console.log(exp,ref)
        return [exp,ref]
      },
      containsHandling(item,finalValue,control_attribute){
        control_attribute = item.is_custom_wrapperd ? "${custom_attribute_reference.": "${attribute_reference.";
        let [expression,reference] = ["",""];
        let symbol = item.symbol;
        if(item.symbol === "lt"){
          symbol = "<"
        }else if(item.symbol === "gt"){
          symbol = ">"
        }else if(item.symbol === "eq"){
          symbol = "=="
        }
        let exp,ref = "";
        // console.log(item);
        if(item.datatype ===  "timestamp" && (item.symbol === "lt" || item.symbol === "gt" || item.symbol === "eq")){
          if(item.dateOutput === 'epochSeconds'){
            exp = ` ${item.expression}${this.noExp(item)} `;
            if(item.id === "rule_attribute_id"){
              ref = String(exp);
            }else {
              ref = ` ${control_attribute+item.attribute_id+"."+item.alias+"}"}${this.noExp(item)} `;
            }
          } else if(item.dateOutput === 'epochMilliSeconds'){
            exp = `${item.expression}${this.noExp(item)} /1000 `;
            if(item.id === "rule_attribute_id"){
              ref = String(exp);
            }else {
              ref = `${control_attribute+item.attribute_id+"."+item.alias+"}"}${this.noExp(item)} /1000 `;
            }
          } else{
            exp = `to_unix_timestamp( ${item.expression}${this.noExp(item)},'${item.dateOutput}' )`;
            if(item.id === "rule_attribute_id"){
              ref = String(exp);
            }else {
              ref = `to_unix_timestamp( ${control_attribute+item.attribute_id+"."+item.alias+"}"}${this.noExp(item)},'${item.dateOutput}' )`;
            }
          }
          expression = `date_diff( '${item.dateDiff}', ${exp} , target_run_ts/1000 ) ${symbol+' '}${finalValue}`
          reference = `date_diff( '${item.dateDiff}', ${ref} , target_run_ts/1000 ) ${symbol+' '}${finalValue}`
        }
        else if(item.symbol === 'contains'){
          expression = `arrays_overlap( ${item.expression}${this.noExp(item)} , array${finalValue} )`;
          // reference = `arrays_overlap( ${item.expression}${this.noExp(item)} ${symbol}, array${finalValue} )`;
          // reference = `arrays_overlap( ${item.no_expression ? item.expression+this.noExp(item) : control_attribute+item.attribute_id+"}"}${symbol}, array${finalValue} )`;
          if(item.id === "rule_attribute_id"){
            reference = String(expression);
          }else {
            reference = `arrays_overlap( ${control_attribute+item.attribute_id+"."+item.alias+"}"}${this.noExp(item)} , array${finalValue} )`;
          }
        }else {
          expression = `${item.expression}${this.noExp(item)} ${symbol+' '}${finalValue}`
          // reference = `${item.expression}${this.noExp(item)} ${item.symbol === '.' ? '.': ' '+' '+item.symbol}${finalValue}`
          if(item.id === "rule_attribute_id"){
            reference = String(expression);
          }else {
            reference = `${control_attribute+item.attribute_id+"."+item.alias+"}"}${this.noExp(item)} ${symbol+' '}${finalValue}`
          }
        }
        return [expression, reference];
      },
      deleteEl(i){
        if(this.tasks && this.tasks.length && this.tasks[i].name === 'rest_api'){
            this.$store.commit('resetRestAttributes');
            this.is_drag_disabled = false
        }
        if(this.tasks && this.tasks.length && this.tasks[i].id === 'array_filter_id'){
          this.$store.dispatch('isValidArrayFilterSchema',false)
          this.$store.dispatch("arrayFilterActive", false);
        }
        this.tasks.splice(i,1);
        this.generateExpression(this.tasks);
      },
      joiner(el,i,e){
        this.tasks[i].joiner = e.target.value;
      },
      inputType(type){
        return ["int","double","long"].includes(type)  ? "number" : "text";
      },
      computedList(i){
        let datatype = this.tasks[i].datatype;
        let defaultOperator = this.dataList.datatypeMapping['string'].allowed_operators;
        let defaultOperatorList = defaultOperator.map(item => {
          let data = {}
          data.id = item;
          data.name = this.dataList.operatorMapping[item].name
          return data
        })
        defaultOperatorList.unshift({id:"",name:"None"})
        if(datatype){
          if(this.dataList.datatypeMapping[datatype]){
            let operator = this.dataList.datatypeMapping[datatype].allowed_operators;
            let arr = operator.map(item => {
              let data = {}
              data.id = item;
              data.name = this.dataList.operatorMapping[item].name
              return data
            })
            arr.unshift({id:"",name:"None"});
            return arr;
          } else {
            return defaultOperatorList;
          }
        }else{
          return defaultOperatorList;
        }
      },
      log(evt) {
        // console.log(evt,this.$store.state.isArrayFilterActive);
        if(this.$store.state.isArrayFilterActive && evt && evt.added && evt.added.element && evt.added.element.id === "array_filter_id"){
          this.tasks.splice(evt.added.newIndex, 1);
          alert("Only one array filter can be used in single rule.")
        }
        if(evt && evt.added && evt.added.element && evt.added.element.id === "array_filter_id"){
          // console.log(this.tasks)
          this.tasks[evt.added.newIndex].cfParams.map((item,i) => {
            this.tasks[evt.added.newIndex].tasks.push({
              name:"array item", paramName:item, id:"array_attribute_params",
              exp: [], parentType:evt.added.element.id, params_index:i+1,
              left_attr_type:"left_text",refr: [], symbol:"", tasks: [], datatype:"string", value:"", viz:""});
          })
          this.$store.dispatch("arrayFilterActive", true);
        }
        if(evt && evt.added && evt.added.element && evt.added.element.name === "array item"){
          if(this.$store.state.isArrayFilterActive){
            this.tasks[evt.added.newIndex]['left_array_attribute_params_schemaOptions'] = this.$store.state.arrayFilterSchema;
            this.tasks[evt.added.newIndex].rhs = [];
            this.tasks[evt.added.newIndex].rhs.push({'id':'array_attribute_rhs', 'left_attr_type':'left_text', 'type':'right'});
            this.tasks[evt.added.newIndex].rhs[0]['right_array_attribute_rhs_schemaOptions'] = this.$store.state.arrayFilterSchema;
          }else{
            alert("Array Item cannot be placed in existing rule");
            this.tasks.splice(evt.added.newIndex, 1);
          }
        }
        if(this.cfParamsLength && this.tasks.length > this.cfParamsLength){
          alert("Custom Function Parameters are already defined.");
          this.tasks.splice(evt.added.newIndex, 1);
        }
        for(let i = 0; i < this.tasks.length; i++){
          if(document.getElementById(`text-${this.depth}-${i}`)){
            document.getElementById(`text-${this.depth}-${i}`).classList.remove("added");
          }
        }
        this.generateExpression(this.tasks);
      },
  
      selectRule:async function(el,i){
        // console.log(this.ref_type)
        let ruleUrl = this.ref_type === "dsl" ? this.$store.state.urls.dslRulesPublish : this.$store.state.urls.rulesPublish;
        let data = await this.$getCall(ruleUrl + el.selected_context);
        this.tasks[i].expression = this.ref_type === "dsl" ? data?.rule_builder_json?.exp?.[0]: data.input_ui_expression;
        this.tasks[i].rule_id = el.selected_context;
        this.refreshBuilder();
      },
      selectOperator(e,el,i){
        let operator = this.dataList.operatorMapping[e.target.value];
        if(operator){
          this.tasks[i].symbol = operator.symbol;
        }else {
          this.tasks[i].symbol = "";
        }
        if(el.datatype === "hydra"){
          if(this.tasks[i].value.length && this.tasks[i].value[0].name){
            this.tasks[i].value = new Array(this.tasks[i].value[0])
          }else {
            this.tasks[i].value = [{
              name:"",
              tag: ""
            }]
          }
          this.tasks[i].viz = "nary";
        }else {
          this.tasks[i].value = [""]
          this.tasks[i].viz = (operator && operator.category) ? operator.category : "binary";
        }
        this.refreshBuilder();
      },
      refreshBuilder(){
        // console.log("refresh builder", this.tasks.length);
        window.setTimeout(e => {
          this.tasks.push("");
          this.tasks.pop("");
        },50)
      },
      selectDataType:async function(e,el,i,date_params_data,type){
        this.refreshBuilder();
        let info
  
        let data;
        if(date_params_data){
          data = date_params_data;
        }else {
          if(type === "dateDiffParamOne" && e === "target_run_ts/1000"){
            this.tasks[i].no_expression = true;
            this.tasks[i].fields = [];
            this.tasks[i].obj_ref = {};
          } else if(type === "dateDiffParamTwo" && e === "target_run_ts/1000"){
            this.tasks[i].no_expression = true;
            this.tasks[i].fieldsTwo = [];
            this.tasks[i].obj_ref_two = {};
          } else if (e !== "target_run_ts/1000"){
            this.tasks[i].no_expression = false;
            this.tasks[i].fields = [];
            this.tasks[i].obj_ref = {};
          }
          // el.attributes.filter((item,i) => {
  
          // if(el.name === "Hydra_segment"){
            // this.refreshBuilder();
          if(e !== "target_run_ts/1000"){
            if(this.controlAttrMapping[this.controlAttrMapping[el.id]]){
              this.controlAttrMapping[this.controlAttrMapping[el.id]].filter((item,i) => {
                if(el.attribute_id === item.id){
                  data = item;
                }
              })
            }else{
              this.controlAttrMapping[el.name].filter((item,i) => {
                if(el.attribute_id === item.id){
                  data = item;
                }
              })
            }
          }
        }
        if(data) {
          if(data.is_custom_wrapperd && data.target_output_attribute && data.target_output_attribute.fields){
            data.fields = JSON.parse(JSON.stringify(data.target_output_attribute.fields));
          }
          this.tasks[i].datatype = data.datatype && data.datatype.toLowerCase();
          this.tasks[i].defaultDatatype = data.datatype && data.datatype.toLowerCase();
          if(data.is_timestamp && type !== "dateDiffParamOne" && type !== "dateDiffParamTwo"){
            this.tasks[i].datatype = "timestamp";
          }
          if(data.datatype!== 'hydra'){
            if(e !== "custom functions"){
              this.customFunctionNameList.filter((item)=> {
                if(item.id === el.custom_function) {
                  this.tasks[i].expression = "#"+item.name+"(${attribute-"+ data.name +"})";
                }
              });
              if(data.target_expression){
                let exp = data.target_expression.replace(/{{attribute}}/g,"${attribute-"+el.selected_context+"}");
                this.tasks[i].expression = exp;
              }else if(e === "attributes"){
  
              }else{
                this.tasks[i].expression = "#getFeatureAttribute(${attribute-"+ data.name +"})";
              }
            }
  
            // only for control which has no expression assigned, hydra check is to exclude hydra segment
            // console.log("type: "+type)
            if(type === 'dateDiffParamTwo'){
              this.tasks[i].fieldsTwo = data.fields ? data.fields : null;
              this.tasks[i].no_expression_two = true;
            }else{
              this.tasks[i].fields = data.fields ? data.fields : null;
              this.tasks[i].no_expression = true;
            }
            if(data.fields && data.fields.length){
              let one = this.$runScehma(data.fields,"");
            }
            if(type === 'dateDiffParamTwo'){
              this.tasks[i].obj_ref_two = JSON.parse(JSON.stringify(this.attrSchema));
              if(!data.fields){
                this.tasks[i].obj_ref_two = {}
              }
            }else{
              this.tasks[i].obj_ref = JSON.parse(JSON.stringify(this.attrSchema));
              if(!data.fields){
                this.tasks[i].obj_ref = {}
              }
            }
          }else{
            this.tasks[i].selectedOperator = ""; // to prevent issue in hydra rule
          }
          if(data && data.is_custom_wrapperd === true){
            this.tasks[i].is_custom_wrapperd = true;
            let ref_id = data.datatype!== 'hydra' && e !== 'custom functions' && data.name !== 'date_diff' && data.name !== "attributes" ? data.id :""
            this.tasks[i].custom_attribute_reference_id = ref_id;
            this.tasks[i].attribute_reference_id = null
          }else{
            this.tasks[i].is_custom_wrapperd = false;
            let ref_id = data.datatype!== 'hydra' && e !== 'custom functions' && data.name !== 'date_diff' && data.name !== "attributes" ? data.id :""
            this.tasks[i].attribute_reference_id = ref_id;
            this.tasks[i].custom_attribute_reference_id = null;
          }
          if(data && data.sample_value){
            this.tasks[i].sample_value = this.$filteredSampleValue(data.sample_value);
            this.tasks[i].defaultSampleValue = this.$filteredSampleValue(data.sample_value);
          }
          if(e !== "custom functions"){
            this.tasks[i].attribute_id = data.id;
          }
          if(data.is_custom_wrapperd && data.target_output_attribute && data.target_output_attribute.is_timestamp){
            this.tasks[i].datatype = "timestamp";
            this.tasks[i].dateOutput = data.target_output_attribute.timestamp_format ? data.target_output_attribute.timestamp_format : "epochSeconds";
            this.tasks[i].sample_value = this.$filteredSampleValue(data.target_output_attribute.sample_value);
            this.tasks[i].defaultSampleValue = this.$filteredSampleValue(data.target_output_attribute.sample_value);
          }else{
            this.tasks[i].dateOutput = data.timestamp_format;
          }
          this.tasks[i].value = [""];
          this.tasks[i].output_datatype = data.output_datatype;
          this.tasks[i].tree_expression = null;
        }
      },
      // getTreeExpression(el,i){
      //   console.log(el)
      //   if(el && el.tree_expression){
      //     let exp =  el.obj_ref[el.tree_expression].parent+"."+el.obj_ref[el.tree_expression].label;;
      //     this.tasks[i].final_tree_expression = exp;
      //     // this.tasks.push("")
      //     // this.tasks.pop("")
      //     return exp;
      //   }
      // },
      isHydraSegment(item) {
          return item === this.hydraSegments[0] ||
                  item === this.hydraSegments[1];
      },
      getHydraAttribute(item) {
          if(item.attribute_id === this.hydraSegments[0]) {
            return '{attribute-user.hydra_segment.hydra_segment}';
          }else if(item.attribute_id === this.hydraSegments[1]) {
            return '{attribute-device.hydra_segment.hydra_segment}';
          }
      },
      getHydraPreview(item) {
          let preview_string = "";
          item.attribute = this.getHydraAttribute(item);
  
          let hydraFuncType = "";
          let itemList = "";
            item.value.map((itemi,i)=>{
                if(i>0) itemList = itemList + ',';
                if(itemi.name){
                    if(itemi.tag)
                        itemList = itemList + "'" +itemi.name + "_" + itemi.tag + "'";
                    else itemList = itemList + "'" +itemi.name +"_U'";
                }
            });
          if(item.attribute_id === "User"){
            hydraFuncType = "getUserHydraSegmentsWithNameTag"
          }else{
            hydraFuncType = "getDeviceHydraSegmentsWithNameTag"
          }
          if(item.selectedOperator === "IN" || item.selectedOperator === "NIN" || item.selectedOperator === "CNT") {
              preview_string = `arrays_overlap( #${hydraFuncType}( $${item.attribute} ), array( ${itemList} ) )`;
              if(item.selectedOperator === "NIN") preview_string = "!" + preview_string;
          }else if(item.selectedOperator === "NCNT") {
              // let itemList = "";
              // let itemi = item.value[0];
              // if(itemi.name) {
              //     if(itemi.tag)
              //         itemList = itemList + "'" +itemi.name + "_" + itemi.tag + "'";
              //     else itemList = itemList + "'" +itemi.name;
              // }
              preview_string = `arrays_contains( #${hydraFuncType }( $${item.attribute} ), array( ${itemList} ) )`;
              if(item.selectedOperator === "NCNT") preview_string = "!" + preview_string;
          }else if(item.selectedOperator === "IsNull" || item.selectedOperator === "IsNotNull") {
              preview_string = `size( #${hydraFuncType }( $${item.attribute} ) ) == 0`
              if(item.selectedOperator === "IsNotNull") preview_string = "!(" + preview_string + ")";
          }
          return preview_string;
      },
      getHydraSegments(item) {
          // to provide each hydra when hydra segment selected
          return this.userHydraSegments;
      },
    }
  };
  </script>
  
  <style>
  
  .vue-treeselect__control {
      height: 24px;
  }
  .vue-treeselect__input-container{
    width:100%;
  }
  .vue-treeselect__value-container{
    height: 24px;
  }
  .vue-treeselect__input{
    width:100%;
    border:0;
  }
  .vue-treeselect__single-value{
    font-size: 12px;
    line-height: 23px;
  }
  
  </style>
  