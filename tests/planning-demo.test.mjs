import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const compile=p=>ts.transpileModule(readFileSync(new URL(p,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const url=code=>`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
const tasksUrl=url(compile('../src/lib/tasks.ts'));
const actionsUrl=url(compile('../src/lib/next-actions.ts'));
const {parseCalendarDate}=await import(tasksUrl);
const {planNextActions}=await import(actionsUrl);
const {DEMO_TASKS,DEMO_VISIBLE_IDS,DEMO_INITIAL_DONE,DEMO_PROGRESS,demoArrival,isCalendarInput}=await import(url(compile('../src/lib/planning-demo.ts').replace('"./tasks"',JSON.stringify(tasksUrl)).replace('"./next-actions"',JSON.stringify(actionsUrl))));
const today=parseCalendarDate('2026-09-25');
test('homepage date presets change the actual engine ranking and target dates',()=>{
 const far=planNextActions(DEMO_TASKS,parseCalendarDate(demoArrival(today,90)),DEMO_INITIAL_DONE,DEMO_PROGRESS,today);
 const near=planNextActions(DEMO_TASKS,parseCalendarDate(demoArrival(today,30)),DEMO_INITIAL_DONE,DEMO_PROGRESS,today);
 assert.equal(far.next[0].task.id,'phone');
 assert.notEqual(near.next[0].task.id,'phone');
 assert.notDeepEqual(far.next.map(d=>d.task.id),near.next.map(d=>d.task.id));
 assert.ok(near.urgentCount>far.urgentCount);
 for(const item of near.next){const original=far.decisions.find(d=>d.task.id===item.task.id);assert.ok(item.latest<original.latest)}
});
test('checking housing unlocks its dependent task and keeps initial example progress separate',()=>{
 const before=planNextActions(DEMO_TASKS,today,DEMO_INITIAL_DONE,DEMO_PROGRESS,today);
 const done={...DEMO_INITIAL_DONE,'housing-search':true};
 const after=planNextActions(DEMO_TASKS,today,done,DEMO_PROGRESS,today);
 assert.equal(before.decisions.find(d=>d.task.id==='housing-secure').status,'blocked');
 assert.equal(after.decisions.find(d=>d.task.id==='housing-secure').status,'todo');
 assert.equal(DEMO_VISIBLE_IDS.filter(id=>DEMO_INITIAL_DONE[id]).length/DEMO_VISIBLE_IDS.length,0.5);
 assert.equal(DEMO_INITIAL_DONE['housing-search'],undefined);
});
test('invalid and incomplete dates cannot replace a valid example date',()=>{
 for(const invalid of ['', '2026-02-30','2026-13-01','2026-09','not a date'])assert.equal(isCalendarInput(invalid),false);
 assert.equal(isCalendarInput('2028-02-29'),true);
 assert.equal(isCalendarInput(demoArrival(today,30)),true);
});
