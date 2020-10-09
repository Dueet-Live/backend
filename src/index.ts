import io from 'socket.io';

const socketIOServer = io(3000);

socketIOServer.on('connect', (socket) => {
  socket.send('Hello!');

  // handle the event sent with socket.send()
  socket.on('message', (data) => {
    console.log(data);
  });

  // handle the event sent with socket.emit()
  socket.on('salutations', (elem1, elem2, elem3) => {
    console.log(elem1, elem2, elem3);
  });
});
