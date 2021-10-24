const express = require('express')
const app = express()
 
app.get('/', function (req, res) {
  res.send('Hello World')
})
 let port = process.env.PORT || 3000;
app.listen(port)
 
require('dotenv').config()

const mySecret = process.env['TOKEN']
const Discord = require('discord.js');
const DisTube = require("distube")
const SoundCloudPlugin = require('@distube/soundcloud')
const SpotifyPlugin = require('@distube/spotify')
const { Client, Intents, MessageEmbed } = require('discord.js');
const client = new Discord.Client({
	intents: [
		'GUILDS',
		'GUILD_VOICE_STATES',
		'GUILD_MESSAGES',
	],
})
const config = {
	prefix: '.',
	token: process.env.TOKEN,
}
// const client = new Discord.Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
// const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.on("ready", () => {
  console.log("Estoy listo!");
});


client.login(mySecret);

const distube = new DisTube.default(client, {
	searchSongs: 1,
	searchCooldown: 30,
	leaveOnEmpty: true,
	emptyCooldown: 0,
	leaveOnFinish: true,
	leaveOnStop: true,
	plugins: [new SoundCloudPlugin.default(), new SpotifyPlugin.default()],
})

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`)
})

client.on('messageCreate', message => {
	if (message.author.bot) return
	if (!message.content.startsWith(config.prefix)) return
	const args = message.content
		.slice(config.prefix.length)
		.trim()
		.split(/ +/g)
	const command = args.shift()
  console.log(command)

	if (command === 'play') distube.play(message, args.join(' '))

	if (['repeat', 'loop'].includes(command)) {
		const mode = distube.setRepeatMode(message)
		message.channel.send(`Set repeat mode to \`${mode ? mode === 2 ? 'All Queue' : 'This Song' : 'Off'}\``)
	}

	if (command === 'stop') {
		distube.stop(message)
		message.channel.send('Stopped the music!')
	}

	if (command === 'resume') distube.resume(message)

	if (command === 'pause') distube.pause(message)

	if (command === 'skip') {
    const queue = distube.getQueue(message)
		if (!queue) {
			message.channel.send('Nothing playing right now!')
		} else {
      
        if ( queue.songs.length < 1){
          distube.skip(message)
        } else {
          message.channel.send("No Next Song")
        }
      
    }
    
    
  }

	if (command === 'queue') {
		const queue = distube.getQueue(message)
		if (!queue) {
			message.channel.send('Nothing playing right now!')
		} else {
			message.channel.send(
				`Current queue:\n${queue.songs
					.map(
						(song, id) =>
							`**${id ? id : 'Playing'}**. ${song.name} - \`${
								song.formattedDuration
							}\``,
					)
					.slice(0, 10)
					.join('\n')}`,
			)
		}
	}
  if (command === 'help') {
    message.channel.send(
      `Commands Help (.)\r\t- .play "song name" = Play Music \r\t- .pause = Pause actual Song \r\t- .resume = Replay paused Song \r\t- .stop = Stop Music, Delete Queue and Disconnect Bot \r\t- .skip = Skip actual Song \r\t- .repeat/.loop This Song = Repeat the Actual Song \r\t- .repeat/.loop All Queue = Repeat all Queue`,
    )
  }

  if (command === 'info') {
    message.channel.send(
      `Test Info`,
    )
  }
	if (
		[
			`3d`,
			`bassboost`,
			`echo`,
			`karaoke`,
			`nightcore`,
			`vaporwave`,
		].includes(command)
	) {
		const filter = distube.setFilter(message, command)
		message.channel.send(
			`Current queue filter: ${filter.join(', ') || 'Off'}`,
		)
	}
})


const status = queue =>
	`Volume: \`${queue.volume}%\` | Filter: \`${queue.filters.join(', ')
		|| 'Off'}\` | Loop: \`${
		queue.repeatMode
			? queue.repeatMode === 2
				? 'All Queue'
				: 'This Song'
			: 'Off'
	}\` | Autoplay: \`${queue.autoplay ? 'On' : 'Off'}\``

// DisTube event listeners, more in the documentation page
distube
	.on('playSong', (queue, song) =>
		queue.textChannel.send(
			`Playing \`${song.name}\` - \`${
				song.formattedDuration
			}\`\nRequested by: ${song.user}\n${status(queue)}`,
		))
	.on('addSong', (queue, song) =>
		queue.textChannel.send(
			`Added ${song.name} - \`${song.formattedDuration}\` to the queue by ${song.user}`,
		))
	.on('addList', (queue, playlist) =>
		queue.textChannel.send(
			`Added \`${playlist.name}\` playlist (${
				playlist.songs.length
			} songs) to queue\n${status(queue)}`,
		))
	// DisTubeOptions.searchSongs = true
	.on('searchResult', (message, result) => {
		let i = 0
		message.channel.send(
			`**Choose an option from below**\n${result
				.map(
					song =>
						`**${++i}**. ${song.name} - \`${
							song.formattedDuration
						}\``,
				)
				.join(
					'\n',
				)}\n*Enter anything else or wait 30 seconds to cancel*`,
		)
	})


  .on('searchCancel', message => message.channel.send(`Searching canceled`))
	.on('searchInvalidAnswer', message =>
		message.channel.send(`searchInvalidAnswer`))
	.on('searchNoResult', message => message.channel.send(`No result found!`))
	.on('error', (textChannel, e) => {
		console.error(e)
		textChannel.send(`An error encountered: ${e.slice(0, 2000)}`)
	})
	.on('finish', queue => queue.textChannel.send('Finish queue!'))
	.on('finishSong', queue => queue.textChannel.send('Finish song!'))
	.on('disconnect', queue => queue.textChannel.send('Disconnected!'))
	.on('empty', queue => queue.textChannel.send('Empty!'))

