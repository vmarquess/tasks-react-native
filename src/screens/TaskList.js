import React, {Component} from 'react'
import { Alert, View, Text, ImageBackground, StyleSheet, FlatList, TouchableOpacity, SafeAreaView} from 'react-native'
import todayImage from '../../assets/imgs/today.jpg'
import moment from 'moment'
import 'moment/locale/pt-br'
import commomStyles from '../commomStyles'
import Task from '../components/Task'
import Icon from 'react-native-vector-icons/FontAwesome'
import AddTask from './AddTask'
import AsyncStorage from '@react-native-community/async-storage'

const initialState = {
  showAddTask: false,
  showDoneTasks: true,
  visibleTasks: [],
  tasks: [],
};

export default class TaskList extends Component {

    state = {
        ...initialState
    }

    componentDidMount = async() => { // chama toda vez que o componente é montado
        const stateString = await AsyncStorage.getItem('tasksState');
        const state = JSON.parse(stateString) || initialState
        this.setState(state, this.filterTasks)

    }

    toggleFilter = () => {
        this.setState({showDoneTasks: !this.state.showDoneTasks}, this.filterTasks) // segundo paremetro é a funcao que vai ser chamada assim que o estado for atualizado
    }

    filterTasks = () => {
        let visibleTasks = null
        if(this.state.showDoneTasks){
            visibleTasks = [...this.state.tasks]
        }
        else{
            visibleTasks = this.state.tasks.filter(task => task.doneAt === null)
        }

        this.setState({visibleTasks})
        AsyncStorage.setItem('tasksState', JSON.stringify(this.state))
    }

    toggleTask = taskId => {
        const tasks = [...this.state.tasks]
        tasks.forEach(task => {
            if(task.id === taskId){
                task.doneAt = task.doneAt ? null : new Date()
            }
        })

        this.setState({tasks}, this.filterTasks)

    }

    addTask = newTask => {
        if(!newTask.desc || !newTask.desc.trim()){
            Alert.alert('Dados inválidos', 'Descrição não informada')
            return
        }

        const tasks = [...this.state.tasks]
        tasks.push({
            id: Math.random(),
            desc: newTask.desc,
            estimateAt: newTask.date,
            doneAt: null
        })

        this.setState({ tasks, showAddTask: false}, this.filterTasks)
        
    }

    deleteTask = id => {
        const tasks = this.state.tasks.filter(task => task.id !== id)
        this.setState({tasks}, this.filterTasks)
    }

    render(){
        const today = moment().locale('pt-br').format('ddd, D [de] MMMM')
        return (
            <SafeAreaView style={styles.container}>
                <AddTask 
                    isVisible={this.state.showAddTask} 
                    onCancel={() => this.setState({showAddTask:false})}
                    onSave={this.addTask}/>
                <ImageBackground 
                    source={todayImage} 
                    style={styles.background}>
                    <View style={styles.iconBar}>
                        <TouchableOpacity onPress={this.toggleFilter}>
                            <Icon 
                                name={this.state.showDoneTasks ? 'eye' : 'eye-slash'} 
                                size={20} 
                                color={commomStyles.colors.secondary}/>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.titleBar}>
                        <Text style={styles.title}>Hoje</Text>
                        <Text style={styles.subtitle}>{today}</Text>
                    </View>
                </ImageBackground>
                <View style={styles.taskList}>
                    <FlatList 
                        data={this.state.visibleTasks}
                        keyExtractor={item => item.id.toString()}
                        renderItem= {({item}) => <Task {...item} 
                        toggleTask={this.toggleTask}
                        onDelete={this.deleteTask}
                        />} />
                </View>
                <TouchableOpacity 
                    style={styles.addButton} 
                    activeOpacity={0.7} 
                    onPress={() => this.setState({showAddTask: true})}>
                    <Icon 
                        name='plus' 
                        size={20} 
                        color={commomStyles.colors.secondary}/>
                </TouchableOpacity>
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1 //flexGrow
    },
    background: {
        flex: 3
    },
    taskList: {
        flex:  7
    },
    titleBar:{
        flex: 1,
        justifyContent: 'flex-end'
    },
    title: {
        fontFamily: commomStyles.fontFamily,
        fontSize: 50,
        color: commomStyles.colors.secondary,
        marginLeft: 20,
        marginBottom: 20
    },
    subtitle: {
        fontFamily: commomStyles.fontFamily,
        color: commomStyles.colors.secondary,
        fontSize: 20,
        marginLeft: 20,
        marginBottom: 30
    },
    iconBar:{
        flexDirection: 'row',
        marginHorizontal: 20,
        justifyContent: 'flex-end',
        marginTop: 10
    },
    addButton: {
        position: 'absolute',
        right: 30,
        bottom: 30,
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: commomStyles.colors.today,
        justifyContent: 'center',
        alignItems: 'center'
    }
})