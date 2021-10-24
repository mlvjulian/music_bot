const Discord = require('discord.js');
const distube = require("distube")

module.exports = {
  name: "play",
  alias: ["p"],

execute (client, message, args){

 const cancion = args.join(" ")
 if(!cancion) return.message.channel.send("Debes escribir una canción")

 if(!message.member.voice.channel) return message.channel.send("Debes estar en un canal de voz")

 if(message.guild.me.voice.channel && messsage.member.voice.channel.id !== message.guild.me.voice.channel.id) return message.channel.send("Debes estar en el mismo canal de voz que yo")

 client.distube.play(message, cancion)


  }

}