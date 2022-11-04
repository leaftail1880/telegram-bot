export const cooldown = 5 * 3.6e6,
  chatcooldown = 3.6e6;

/*
|--------------------------------------------------------------------------
| Команды
|--------------------------------------------------------------------------
|
| Этот файл содержит в себе импорты всех команд из других файлов папки
| 
| 

new cmd({
  name: '',
  specprefix: false,
  description: 'Описание',
  permisson: 0,
  hide: false,
  type: 'all'
}, (ctx, args, data, command) => {
  
})
*/

const public_commands = ["abc", "call", "google", "name", "pin", "version"];

for (const cmd of public_commands) import(`./public/${cmd}.js`);

const private_commands = ["db", "log", "stop", "sudo"];

for (const cmd of private_commands) import(`./private/${cmd}.js`);
