package com.example;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.stereotype.Service;

import java.util.concurrent.ExecutionException;

@Service
public class TournamentService {

    public Tournament getTournament(String id) throws ExecutionException, InterruptedException {
        Firestore dbFirestore = FirestoreClient.getFirestore();
        ApiFuture<DocumentSnapshot> documentFuture = dbFirestore.collection("tournaments").document(id).get();
        DocumentSnapshot document = documentFuture.get();
        if (document.exists()) {
            return document.toObject(Tournament.class);
        } else {
            return null;
        }
    }
}
