import { Socket } from 'socket.io';
import { UPDATE_USER_LOCATION } from '../constants/socket-constant';
import { updatetUserLocation } from './socket-services';

export default (socket: Socket) => {
	console.log(`User ${socket.id} connected`);
	socket.on(UPDATE_USER_LOCATION, updatetUserLocation);
};
