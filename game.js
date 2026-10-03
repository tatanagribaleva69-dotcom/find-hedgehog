// Каждое задание — название фигуры. Здесь можно менять порядок и длину игры.
const tasks = ['triangle', 'circle', 'square', 'triangle', 'circle'];
const names = {triangle:'Треугольник', square:'Квадрат', circle:'Круг'};
let position = 0;
let busy = false;
let timer;
const el = id => document.getElementById(id);
const buttons = [...document.querySelectorAll('[data-answer]')];
function render() {
  const finished = position === tasks.length;
  el('hero').style.left = `${position / tasks.length * 80}%`;
  el('steps').innerHTML = tasks.map((_, i) => `<span class="step ${i < position ? 'done' : ''}" aria-label="Шаг ${i+1}${i < position ? ', пройден' : ''}">${i < position ? '✓' : i+1}</span>`).join('');
  el('counter').textContent = finished ? 'УРА, МЫ ДОШЛИ!' : `ШАГ ${position+1} ИЗ ${tasks.length}`;
  el('question').textContent = finished ? 'Ты нашёл ёжика!' : 'Какая это фигура?';
  el('shape').innerHTML = finished ? '<span class="celebrate" aria-hidden="true">🦔💛</span>' : `<div class="shape ${tasks[position]}" role="img" aria-label="Фигура, название которой нужно выбрать"></div>`;
  el('answers').hidden = finished;
  el('answers').style.display = finished ? 'none' : '';
  el('restart').hidden = !finished;
  el('feedback').textContent = finished ? '😊 Спасибо! Теперь друзья снова вместе.' : 'Выбери название фигуры';
  buttons.forEach(b => {b.disabled = false; b.classList.remove('correct','wrong');});
}
function answer(value) {
  if (!(value in names)) throw new Error('Неизвестная фигура');
  if (busy || position === tasks.length) return Promise.resolve({accepted:false,step:position});
  busy = true;
  const correct = value === tasks[position];
  buttons.forEach(b => {b.disabled=true;if(b.dataset.answer===value)b.classList.add(correct?'correct':'wrong');});
  el('feedback').textContent = correct ? '😊 Правильно! Идём дальше!' : '😢 Попробуй ещё раз. У тебя получится!';
  return new Promise(resolve => {timer=setTimeout(() => {
    if(correct){position++;render();}else{buttons.forEach(b=>{b.disabled=false;b.classList.remove('wrong');});}
    busy=false;
    resolve({accepted:true,correct,step:position,finished:position===tasks.length});
  },correct?1300:1600);});
}
buttons.forEach(b=>b.addEventListener('click',()=>answer(b.dataset.answer)));
el('restart').addEventListener('click',()=>{clearTimeout(timer);position=0;busy=false;render();buttons[0].focus();});
render();
// Поддержка браузеров, в которых доступен WebMCP.
if(document.modelContext?.registerTool){try{Promise.resolve(document.modelContext.registerTool({name:'answer_shape',description:'Выбрать название текущей фигуры в игре и дождаться результата.',inputSchema:{type:'object',properties:{shape:{type:'string',enum:Object.keys(names)}},required:['shape'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:input=>{if(!input||typeof input!=='object'||Object.keys(input).some(k=>k!=='shape'))throw new Error('Неверный ответ');return answer(input.shape);}})).catch(()=>{});}catch{}}
