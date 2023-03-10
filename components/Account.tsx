import {useState, useEffect} from 'react'
import {supabase} from '../lib/supabase'
import {StyleSheet, View, Alert} from 'react-native'
import {Button, Input} from 'react-native-elements'
import {Session} from '@supabase/supabase-js'
import Avatar from './Avatar'

export default function Account({session}: { session: Session }) {
    const [loading, setLoading] = useState(true)
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [avatarUrl, setAvatarUrl] = useState('')

    useEffect(() => {
        if (session) getProfile()
    }, [session])

    async function getProfile() {
        try {
            setLoading(true)
            if (!session?.user) throw new Error('No user on the session!')

            let {data, error, status} = await supabase
                .from('profiles')
                .select(`first_name, last_name, avatar_url`)
                .eq('id', session?.user.id)
                .single()
            if (error && status !== 406) {
                throw error
            }

            if (data) {
                setFirstName(data.first_name)
                setLastName(data.last_name)
                setAvatarUrl(data.avatar_url)
            }
        } catch (error) {
            if (error instanceof Error) {
                Alert.alert(error.message)
            }
        } finally {
            setLoading(false)
        }
    }

    async function updateProfile({first_name, last_name, avatar_url}: {
        first_name: string
        last_name: string
        avatar_url: string
    }) {
        try {
            setLoading(true)
            if (!session?.user) throw new Error('No user on the session!')

            const updates = {
                id: session?.user.id,
                first_name,
                last_name,
                avatar_url,
                updated_at: new Date(),
            }

            let {error} = await supabase.from('profiles').upsert(updates)

            if (error) {
                throw error
            }
        } catch (error) {
            if (error instanceof Error) {
                Alert.alert(error.message)
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <View>

            <View>
                <Avatar
                    size={200}
                    url={avatarUrl}
                    onUpload={(url: string) => {
                        setAvatarUrl(url)
                        updateProfile({firstName, lastName, avatar_url: url})
                    }}
                />
            </View>

            <View style={[styles.verticallySpaced, styles.mt20]}>
                <Input label="Email" value={session?.user?.email} disabled/>
            </View>

            <View style={styles.verticallySpaced}>
                <Input label="Firstname" value={firstName || ''} onChangeText={(text) => setFirstName(text)}/>
            </View>

            <View style={styles.verticallySpaced}>
                <Input label="Website" value={lastName || ''} onChangeText={(text) => setLastName(text)}/>
            </View>

            <View style={[styles.verticallySpaced, styles.mt20]}>
                <Button
                    title={loading ? 'Loading ...' : 'Update'}
                    onPress={() => updateProfile({firstName, lastName, avatar_url: avatarUrl})}
                    disabled={loading}
                />
            </View>

            <View style={styles.verticallySpaced}>
                <Button title="Sign Out" onPress={() => supabase.auth.signOut()}/>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginTop: 40,
        padding: 12,
    },
    verticallySpaced: {
        paddingTop: 4,
        paddingBottom: 4,
        alignSelf: 'stretch',
    },
    mt20: {
        marginTop: 20,
    },
})