import{p as U}from"./chunk-OQCM5LHU-IVYkaWxr.js";import{ax as S,ap as z,aY as Y,Q as j,F as Q,G as Z,s as q,l as H,n as J,m as K,_ as p,y as F,I as X,o as tt,R as et,Y as at,a4 as rt,z as nt}from"./index-CzQ-6GRY.js";import{p as it}from"./gitGraph-YCYPL57B-CuUINsGR.js";import{d as N}from"./arc-BDgDWSk_.js";import{o as st}from"./ordinal-Cboi1Yqb.js";import"./_baseUniq--ApJnZ6D.js";import"./_basePickBy-DNpUwl13.js";import"./clone-BUyH6fCn.js";import"./init-Gi6I4Gst.js";function ot(t,a){return a<t?-1:a>t?1:a>=t?0:NaN}function lt(t){return t}function ct(){var t=lt,a=ot,m=null,o=S(0),g=S(z),x=S(0);function i(e){var r,l=(e=Y(e)).length,c,A,h=0,u=new Array(l),n=new Array(l),v=+o.apply(this,arguments),w=Math.min(z,Math.max(-z,g.apply(this,arguments)-v)),f,T=Math.min(Math.abs(w)/l,x.apply(this,arguments)),$=T*(w<0?-1:1),d;for(r=0;r<l;++r)(d=n[u[r]=r]=+t(e[r],r,e))>0&&(h+=d);for(a!=null?u.sort(function(y,C){return a(n[y],n[C])}):m!=null&&u.sort(function(y,C){return m(e[y],e[C])}),r=0,A=h?(w-l*$)/h:0;r<l;++r,v=f)c=u[r],d=n[c],f=v+(d>0?d*A:0)+$,n[c]={data:e[c],index:r,value:d,startAngle:v,endAngle:f,padAngle:T};return n}return i.value=function(e){return arguments.length?(t=typeof e=="function"?e:S(+e),i):t},i.sortValues=function(e){return arguments.length?(a=e,m=null,i):a},i.sort=function(e){return arguments.length?(m=e,a=null,i):m},i.startAngle=function(e){return arguments.length?(o=typeof e=="function"?e:S(+e),i):o},i.endAngle=function(e){return arguments.length?(g=typeof e=="function"?e:S(+e),i):g},i.padAngle=function(e){return arguments.length?(x=typeof e=="function"?e:S(+e),i):x},i}var O=j.pie,G={sections:new Map,showData:!1,config:O},M=G.sections,R=G.showData,ut=structuredClone(O),pt=p(()=>structuredClone(ut),"getConfig"),gt=p(()=>{M=new Map,R=G.showData,X()},"clear"),dt=p(({label:t,value:a})=>{M.has(t)||(M.set(t,a),F.debug(`added new section: ${t}, with value: ${a}`))},"addSection"),ft=p(()=>M,"getSections"),mt=p(t=>{R=t},"setShowData"),ht=p(()=>R,"getShowData"),P={getConfig:pt,clear:gt,setDiagramTitle:Q,getDiagramTitle:Z,setAccTitle:q,getAccTitle:H,setAccDescription:J,getAccDescription:K,addSection:dt,getSections:ft,setShowData:mt,getShowData:ht},vt=p((t,a)=>{U(t,a),a.setShowData(t.showData),t.sections.map(a.addSection)},"populateDb"),yt={parse:p(async t=>{const a=await it("pie",t);F.debug(a),vt(a,P)},"parse")},St=p(t=>`
  .pieCircle{
    stroke: ${t.pieStrokeColor};
    stroke-width : ${t.pieStrokeWidth};
    opacity : ${t.pieOpacity};
  }
  .pieOuterCircle{
    stroke: ${t.pieOuterStrokeColor};
    stroke-width: ${t.pieOuterStrokeWidth};
    fill: none;
  }
  .pieTitleText {
    text-anchor: middle;
    font-size: ${t.pieTitleTextSize};
    fill: ${t.pieTitleTextColor};
    font-family: ${t.fontFamily};
  }
  .slice {
    font-family: ${t.fontFamily};
    fill: ${t.pieSectionTextColor};
    font-size:${t.pieSectionTextSize};
    // fill: white;
  }
  .legend text {
    fill: ${t.pieLegendTextColor};
    font-family: ${t.fontFamily};
    font-size: ${t.pieLegendTextSize};
  }
`,"getStyles"),xt=St,At=p(t=>{const a=[...t.entries()].map(o=>({label:o[0],value:o[1]})).sort((o,g)=>g.value-o.value);return ct().value(o=>o.value)(a)},"createPieArcs"),wt=p((t,a,m,o)=>{F.debug(`rendering pie chart
`+t);const g=o.db,x=tt(),i=et(g.getConfig(),x.pie),e=40,r=18,l=4,c=450,A=c,h=at(a),u=h.append("g");u.attr("transform","translate("+A/2+","+c/2+")");const{themeVariables:n}=x;let[v]=rt(n.pieOuterStrokeWidth);v??(v=2);const w=i.textPosition,f=Math.min(A,c)/2-e,T=N().innerRadius(0).outerRadius(f),$=N().innerRadius(f*w).outerRadius(f*w);u.append("circle").attr("cx",0).attr("cy",0).attr("r",f+v/2).attr("class","pieOuterCircle");const d=g.getSections(),y=At(d),C=[n.pie1,n.pie2,n.pie3,n.pie4,n.pie5,n.pie6,n.pie7,n.pie8,n.pie9,n.pie10,n.pie11,n.pie12],D=st(C);u.selectAll("mySlices").data(y).enter().append("path").attr("d",T).attr("fill",s=>D(s.data.label)).attr("class","pieCircle");let W=0;d.forEach(s=>{W+=s}),u.selectAll("mySlices").data(y).enter().append("text").text(s=>(s.data.value/W*100).toFixed(0)+"%").attr("transform",s=>"translate("+$.centroid(s)+")").style("text-anchor","middle").attr("class","slice"),u.append("text").text(g.getDiagramTitle()).attr("x",0).attr("y",-(c-50)/2).attr("class","pieTitleText");const b=u.selectAll(".legend").data(D.domain()).enter().append("g").attr("class","legend").attr("transform",(s,k)=>{const E=r+l,_=E*D.domain().length/2,B=12*r,V=k*E-_;return"translate("+B+","+V+")"});b.append("rect").attr("width",r).attr("height",r).style("fill",D).style("stroke",D),b.data(y).append("text").attr("x",r+l).attr("y",r-l).text(s=>{const{label:k,value:E}=s.data;return g.getShowData()?`${k} [${E}]`:k});const L=Math.max(...b.selectAll("text").nodes().map(s=>(s==null?void 0:s.getBoundingClientRect().width)??0)),I=A+e+r+l+L;h.attr("viewBox",`0 0 ${I} ${c}`),nt(h,c,I,i.useMaxWidth)},"draw"),Ct={draw:wt},Gt={parser:yt,db:P,renderer:Ct,styles:xt};export{Gt as diagram};
