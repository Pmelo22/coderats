import { NextRequest, NextResponse } from 'next/server'
import { collection, doc, addDoc, getDocs, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export async function GET() {
  try {
    const noticesRef = collection(db, 'admin_notices')
    const q = query(noticesRef, orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    
    const notices = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    return NextResponse.json({ success: true, notices })
  } catch (error) {
    console.error('Erro ao buscar avisos:', error)
    return NextResponse.json({
      success: false,
      message: 'Erro ao buscar avisos'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, message, type, location, isActive } = await request.json()
    
    if (!title || !message || !type || !location) {
      return NextResponse.json({
        success: false,
        message: 'Título, mensagem, tipo e localização são obrigatórios'
      }, { status: 400 })
    }
    
    const noticeData = {
      title,
      message,
      type, // 'info', 'warning', 'success', 'error'
      location, // 'home', 'ranking', 'both'
      isActive: isActive ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    const docRef = await addDoc(collection(db, 'admin_notices'), noticeData)
    
    return NextResponse.json({
      success: true,
      message: 'Aviso criado com sucesso',
      id: docRef.id
    })
  } catch (error) {
    console.error('Erro ao criar aviso:', error)
    return NextResponse.json({
      success: false,
      message: 'Erro ao criar aviso'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, title, message, type, location, isActive } = await request.json()
    
    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'ID do aviso é obrigatório'
      }, { status: 400 })
    }
    
    const updateData = {
      ...(title && { title }),
      ...(message && { message }),
      ...(type && { type }),
      ...(location && { location }),
      ...(typeof isActive === 'boolean' && { isActive }),
      updatedAt: new Date().toISOString()
    }
    
    const docRef = doc(db, 'admin_notices', id)
    await updateDoc(docRef, updateData)
    
    return NextResponse.json({
      success: true,
      message: 'Aviso atualizado com sucesso'
    })
  } catch (error) {
    console.error('Erro ao atualizar aviso:', error)
    return NextResponse.json({
      success: false,
      message: 'Erro ao atualizar aviso'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'ID do aviso é obrigatório'
      }, { status: 400 })
    }
    
    const docRef = doc(db, 'admin_notices', id)
    await deleteDoc(docRef)
    
    return NextResponse.json({
      success: true,
      message: 'Aviso excluído com sucesso'
    })
  } catch (error) {
    console.error('Erro ao excluir aviso:', error)
    return NextResponse.json({
      success: false,
      message: 'Erro ao excluir aviso'
    }, { status: 500 })
  }
}
