const socket = io();

// Elements
const $messageForm = document.querySelector('#form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#shareLocation')
const $messages = document.querySelector('#displayMessage')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#siderbar-template').innerHTML

//options
const { userName, groupName } = Qs.parse(location.search, { ignoreQueryPrefix: true })

//function for scroll over data
const autoScroll = () => {
    $messages.screenTop = $messages.scrollHeight
}

//send new user data to server
socket.emit('join-group', { userName, groupName }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})

//get data of group from server
socket.on('groupData', ({groupname , users}) => {
    const html = Mustache.render(sidebarTemplate, {
        groupname,
        users
    })
    document.querySelector('#chatsidebar').innerHTML = html
})

//get data from server
socket.on('serverMessage', (message) => {
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll();
})

//get data from server
socket.on('locationMessage', (message) => {
    console.log(message)
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll();
})

$messageForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (e.target.elements.sendMessage.value) {
        //send message to server from client
        socket.emit('chatMessage', e.target.elements.sendMessage.value, (error) => {
            if (error) {
                return console.log(error)
            } else {
                $messageFormInput.value = ''
                $messageFormInput.focus()
                console.log('Message delivered!')
            }
        });
    }
});

$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }

    navigator.geolocation.getCurrentPosition((position) => {
        if (position) {
            //get location and send to server.
            socket.emit('sendLocation', {
                'latitude': position.coords.latitude,
                'longitude': position.coords.longitude
            }, () => {
                $sendLocationButton.removeAttribute('disabled')
                console.log('Location shared!')
            })
        }
    })
})