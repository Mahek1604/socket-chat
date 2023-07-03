const users = [];

const addUser = ({ id, userName, groupName }) => {

    // Clean the data
    let username = userName.trim().toLowerCase()
    let groupname = groupName.trim().toLowerCase()

    // Validate the data
    if (!userName || !groupName) {
        return {
            error: 'Username and GroupName are required!'
        }
    }

    // Check for existing user
    const existingUser = users.find((user) => {
        return user.groupName === groupname && user.userName === username
    })

    // Validate username
    if (existingUser) {
        return {
            error: 'Username is in use!'
        }
    }

    // Store user
    const user = { id, userName, groupName }
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const filterIndex = users.findIndex((user) => user.id === id)
    if (filterIndex !== -1) {
        return users.splice(filterIndex, 1)[0]
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id)
}

const getUsersInRoom = (groupName) => {
    return users.filter((user) => user.groupName === groupName)
}

module.exports = { addUser, removeUser, getUser, getUsersInRoom }