import test from 'node:test'
import assert from 'node:assert/strict'
import { calculateQuote } from '../supabase/functions/_shared/quote.ts'
const user = '39d7b304-7518-48f2-a236-4d9096ec3c01'
const photo = `${user}/f5f12d48-0afe-4acc-9cac-2c9cd32bfa11.jpg`
const products = [
 {id:'heart-keychain',name:'Heart',price_qar:15,approved:true,active:true},
 {id:'ribbed-planter',name:'Planter',price_qar:40,approved:false,active:true},
 {id:'henna-stencil',name:'Henna',price_qar:25,approved:true,active:true},
 {id:'lithophane-small',name:'Lithophane',price_qar:65,approved:true,active:true},
 {id:'led-base',name:'LED',price_qar:25,approved:true,active:true},
]
test('uses authoritative prices and quantities, ignoring submitted prices',()=>{
 const result=calculateQuote([{productId:'heart-keychain',quantity:3,color:1,price:0.01}],products,user)
 assert.equal(result.total,45);assert.equal(result.items[0].unitPrice,15)
})
test('rejects quantities that could produce fractional, negative, or oversized orders',()=>{
 for(const quantity of [0,-1,1.5,21,NaN]) assert.throws(()=>calculateQuote([{productId:'heart-keychain',quantity,color:0}],products,user))
})
test('rejects an unapproved product and unknown colors',()=>{
 assert.throws(()=>calculateQuote([{productId:'ribbed-planter',quantity:1,color:0}],products,user),/approval/)
 assert.throws(()=>calculateQuote([{productId:'heart-keychain',quantity:1,color:4}],products,user),/colour/)
})
test('prices lithophane dimensions and optional base on the server',()=>{
 const result=calculateQuote([{productId:'lithophane',quantity:2,photoPath:photo,config:{size:'small',shape:'arch',zoom:1,led:true}}],products,user)
 assert.equal(result.total,180)
})
test('rejects another customer photo and path traversal',()=>{
 for(const photoPath of ['someone-else/photo.jpg',`${user}/../private.jpg`,`${user}/not-a-valid-asset.jpg`]) assert.throws(()=>calculateQuote([{productId:'lithophane',quantity:1,photoPath,config:{size:'small',shape:'arch',zoom:1,led:false}}],products,user),/photograph/)
})
test('accepts valid henna geometry but rejects unsupported or out-of-bounds motifs',()=>{
 const motif={kind:'flower',x:750,y:150,size:100,rotation:0}
 assert.equal(calculateQuote([{productId:'henna-stencil',quantity:1,config:{motifs:[motif]}}],products,user).total,25)
 for(const invalid of [{...motif,x:-1},{...motif,size:200},{...motif,rotation:999},{...motif,kind:'script'},{...motif,y:NaN}]) assert.throws(()=>calculateQuote([{productId:'henna-stencil',quantity:1,config:{motifs:[invalid]}}],products,user))
})
test('rejects empty bags and unbounded design counts',()=>{
 assert.throws(()=>calculateQuote([],products,user));assert.throws(()=>calculateQuote(Array(31).fill({productId:'heart-keychain',quantity:1,color:0}),products,user))
})

test('internal lithophane price IDs and add-ons cannot bypass custom-photo validation',()=>{
 for(const productId of ['lithophane-small','led-base']) assert.throws(()=>calculateQuote([{productId,quantity:1,color:0}],products,user),/product identifier/)
})
