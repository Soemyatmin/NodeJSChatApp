const socket = io();
// Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');

const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

// Templates
const $messageTemplate = document.querySelector('#message-template').innerHTML;
const $locationMessageTemplate = document.querySelector('#location-message-template').innerHTML;
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

//Options
const {
  username,
  room
} = searchToObject();




socket.on('locationMessage', (url) => {
  console.log(url);
  const html = Mustache.render($locationMessageTemplate, {
    username: message.username,
    URL: url.url,
    createdAt: moment(url.createdAt).format('HH:mm')
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoScrolling();
});

socket.on('message', (message) => {
  const html = Mustache.render($messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format('HH:mm')
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoScrolling();
});

socket.on('roomData', ({
  room,
  users
}) => {
  const html = Mustache.render($sidebarTemplate, {
    room,
    users
  });
  document.querySelector('#sidebar').innerHTML = html;
});

$messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  $messageFormButton.setAttribute('disabled', 'disabled');
  const message = e.target.elements.message.value;
  socket.emit('sendMessage', message, (error) => {
    $messageFormButton.removeAttribute('disabled');
    $messageFormInput.value = '';
    $messageFormInput.focus();
    if (error) {
      return console.log(error);
    }
    console.log("message was delivered");
  });
});

$sendLocationButton.addEventListener('click', () => {
  if (!navigator.geolocation) {
    //socket.emit('sendMessage', 'Geolocation is not suppport by your browser');
    return alert('Geolocation is not suppport by your browser');
  }
  $sendLocationButton.setAttribute('disabled', 'disabled');
  navigator.geolocation.getCurrentPosition((position) => {
    console.log(position);
    socket.emit('sharelocation', {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    }, () => {
      $sendLocationButton.removeAttribute('disabled');
      console.log("location shared");
    });
  });
});

socket.emit('join', {
  username,
  room
}, (error) => {
  if (error) {
    alert(error);
    location.href = '/'
  }
});

function searchToObject() {
  var pairs = window.location.search.substring(1).split("&"),
    obj = {},
    pair,
    i;
  for (i in pairs) {
    if (pairs[i] === "") continue;
    pair = pairs[i].split("=");
    obj[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
  }
  return obj;
}

function autoScrolling() {
  // new message elements
  const $newMessage = $messages.lastElementChild;

  // Height of the new messages
  const newMessageStyle = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyle.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // Visible height
  const visibleHeight = $messages.offsetHeight;

  // Height of messages container
  const containerHeight = $messages.scrollHeight;

  // How far have i Scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
}
