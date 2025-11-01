document.getElementById('playMusic').addEventListener('click', playMusic)
function playMusic() {
  const playButton = document.getElementById('playButton')
  const audioFiles = [
    'Isekai_Isekai.mp3',
    'saikomicarts.mp3',
    'Saikomic_en_la_Zona.mp3',
    'Tomboygod.mp3',
  ] // "op_random2.mp3", "anime_fin.mp3", "trap_fin.mp3", "rock_fin.mp3", "yugi_op.mp3", "anime_fin.mp3", "trap_fin.mp3", "saiko_qlao.mp3", "Tomboygod.mp3", "diatranquilo.mp3", "gustos.mp3",
  const randomIndex = Math.floor(Math.random() * audioFiles.length)
  const audioSrc = 'audios/' + audioFiles[randomIndex]
  var audio = document.getElementById('cancion')
  ajustarVolumen(0.7)

  if (audio.paused) {
    audio.src = audioSrc
    audio.play()
    playButton.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" class="icon icon-tabler icons-tabler-filled icon-tabler-player-pause"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 4h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2z" /><path d="M17 4h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2z" /></svg>'
  } else {
    audio.pause()
    playButton.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="playButton" class="icon icon-tabler icons-tabler-outline icon-tabler-player-play"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M7 4v16l13 -8z" /></svg>'
  }

  audio.addEventListener('ended', function () {
    playButton.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="playButton" class="icon icon-tabler icons-tabler-outline icon-tabler-player-play"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M7 4v16l13 -8z" /></svg>'
  })

  function ajustarVolumen(nuevoVolumen) {
    nuevoVolumen = Math.max(0, Math.min(1, nuevoVolumen))
    audio.volume = nuevoVolumen
  }
}
